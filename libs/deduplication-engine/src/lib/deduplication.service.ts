import {
  Participant,
  DeduplicationRecord,
  ScoringMechanism,
  DeduplicationRecordDefinition,
  DenormalisedDeduplicationRecord,
  DenormalisedDeduplicationRecordSchema,
  Pagination,
} from '@nrcno/core-models';
import { ParticipantService } from '@nrcno/core-prm-engine';

import * as DeduplicationStore from './deduplication.store';
import { config, totalWeight } from './config';

const cutoff = 0.1;
const batchSize = 100;

const participantService = new ParticipantService();

interface IDeduplicationService {
  getDuplicatesForParticipant: (
    participant: Partial<Participant>,
  ) => Promise<DeduplicationRecordDefinition[]>;
  compareAllParticipants: () => Promise<void>;
  mergeDuplicate: (
    participantId: string,
    duplicateParticipantId: string,
    resolvedParticipant: Participant,
  ) => Promise<Participant>;
  ignoreDuplicate: (
    participantId: string,
    duplicateParticipantId: string,
  ) => Promise<void>;
  listDuplicates: (pagination: Pagination) => Promise<DeduplicationRecord[]>;
  checkDuplicatesWithinList: (
    participants: Participant[],
  ) => Promise<DeduplicationRecordDefinition[]>;
  denormaliseDuplicateRecords: (
    duplicates: DeduplicationRecord[],
  ) => Promise<DenormalisedDeduplicationRecord[]>;
}

// Compare two participants
const compareParticipants = (
  participantA: Partial<Participant>,
  participantB: Participant,
): DeduplicationRecordDefinition => {
  const scores: DeduplicationRecord['scores'] = Object.entries(config).reduce(
    (acc, [key, { score, weight }]) => {
      const s = score(participantA, participantB);
      return {
        ...acc,
        [key]: {
          raw: s,
          weighted: s * weight,
        },
      };
    },
    {},
  );

  const isExactMatch = Object.entries(scores).some(
    ([key, { raw }]) =>
      (config[key].mechanism === ScoringMechanism.ExactOrNothing ||
        config[key].mechanism === ScoringMechanism.ExactOrWeighted) &&
      raw === 1,
  );

  const isExactNoMatch = Object.entries(scores).some(
    ([key, { raw }]) =>
      (config[key].mechanism === ScoringMechanism.ExactOrNothing ||
        config[key].mechanism === ScoringMechanism.ExactOrWeighted) &&
      raw === -1,
  );

  const weightedScore = (() => {
    if (isExactMatch) return 1;
    if (isExactNoMatch) return 0;
    const score =
      Object.entries(scores).reduce((acc, [key, { weighted }]) => {
        if (config[key].mechanism === ScoringMechanism.ExactOrNothing) {
          return acc;
        }
        return acc + weighted;
      }, 0) / totalWeight;
    return Math.max(0, score);
  })();

  return {
    participantIdA: participantA.id,
    participantIdB: participantB.id,
    weightedScore,
    scores,
  };
};

// Used for finding duplicates when inputting a new participant
const getDuplicatesForParticipant = async (
  participantA: Partial<Participant>,
): Promise<DeduplicationRecordDefinition[]> => {
  const getDuplicatesForParticipantIdBatch = async (
    startIndex: number,
  ): Promise<DeduplicationRecordDefinition[]> => {
    const participants = await participantService.list({
      startIndex,
      pageSize: batchSize,
    });
    return participants.map((participantB) =>
      compareParticipants(participantA, participantB),
    );
  };

  const results: DeduplicationRecordDefinition[] = [];
  const totalParticipants = await participantService.count();
  const batches = Math.ceil(totalParticipants / batchSize);

  for (let i = 0; i < batches; i++) {
    const startIdx = i * batchSize;
    const records = await getDuplicatesForParticipantIdBatch(startIdx);
    for (const record of records) {
      if (record.weightedScore > cutoff) {
        results.push(record);
      }
    }
  }

  return results.sort((a, b) => b.weightedScore - a.weightedScore);
};

// Used for the worker to calculate existing duplicates
const compareAllParticipants = async (): Promise<void> => {
  const getDuplicatesForParticipantIdBatch = async (
    startIndex: number,
  ): Promise<DeduplicationRecordDefinition[]> => {
    const participants = await participantService.list({
      startIndex,
      pageSize: batchSize,
    });
    return participants.flatMap((participantA) =>
      participants.map((participantB) =>
        compareParticipants(participantA, participantB),
      ),
    );
  };

  const totalParticipants = await participantService.count();
  const batches = Math.ceil(totalParticipants / batchSize);
  for (let i = 0; i < batches; i++) {
    const startIdx = i * batchSize;
    const records = await getDuplicatesForParticipantIdBatch(startIdx);
    const results = records.filter(
      (r) => r.participantIdA !== r.participantIdB && r.weightedScore > cutoff,
    );
    if (results.length > 0) {
      await DeduplicationStore.upsert(results);
    }
  }
};

// Used for resolving duplicates
const mergeDuplicate = async (
  participantId: string,
  duplicateParticipantId: string,
  resolvedParticipant: Participant,
): Promise<Participant> => {
  await DeduplicationStore.deletePair(participantId, duplicateParticipantId);
  await DeduplicationStore.logResolution(
    participantId,
    duplicateParticipantId,
    'merge',
  );

  const participant = await participantService.update(
    participantId,
    resolvedParticipant,
  );

  if (!participant) {
    throw new Error('Participant not found');
  }

  return participant;
};

// Used for resolving duplicates
const ignoreDuplicate = async (
  participantId: string,
  duplicateParticipantId: string,
): Promise<void> => {
  await DeduplicationStore.deletePair(participantId, duplicateParticipantId);
  await DeduplicationStore.logResolution(
    participantId,
    duplicateParticipantId,
    'ignore',
  );
};

// Used for showing table of existing duplicates
const listDuplicates = async (
  pagination: Pagination,
): Promise<DeduplicationRecord[]> => {
  return DeduplicationStore.list(pagination);
};

// Used for checking duplicates within a file
const checkDuplicatesWithinList = async (
  participants: Participant[],
): Promise<DeduplicationRecordDefinition[]> => {
  const records: DeduplicationRecordDefinition[] = [];
  for (const participantA of participants) {
    for (const participantB of participants) {
      if (participantA.id === participantB.id) continue;
      const record = compareParticipants(participantA, participantB);
      if (record.weightedScore > cutoff) {
        records.push(record);
      }
    }
  }

  return records.sort((a, b) => b.weightedScore - a.weightedScore);
};

const denormaliseDuplicateRecords = async (
  duplicates: DeduplicationRecord[],
): Promise<DenormalisedDeduplicationRecord[]> => {
  const participantIds = duplicates
    .flatMap((d) => [d.participantIdA, d.participantIdB])
    .filter((id): id is string => id !== null && id !== undefined);
  const participantsMap = (
    await Promise.all(participantIds.map((id) => participantService.get(id)))
  ).reduce<Record<string, Participant>>(
    (acc, p) =>
      p
        ? {
            ...acc,
            [p.id]: p,
          }
        : acc,
    {},
  );
  return duplicates.map((d) =>
    DenormalisedDeduplicationRecordSchema.parse({
      ...d,
      participantA: d.participantIdA ? participantsMap[d.participantIdA] : null,
      participantB: participantsMap[d.participantIdB],
    }),
  );
};

export const DeduplicationService: IDeduplicationService = {
  getDuplicatesForParticipant,
  compareAllParticipants,
  mergeDuplicate,
  ignoreDuplicate,
  listDuplicates,
  checkDuplicatesWithinList,
  denormaliseDuplicateRecords,
};

import {
  Participant,
  DeduplicationRecord,
  ScoringMechanism,
} from '@nrcno/core-models';
import { PrmService } from '@nrcno/core-prm-engine';

import * as DeduplicationStore from './deduplication.store';
import { config, totalWeight } from './config';

const cutoff = 0.8;
const batchSize = 1000;

const ParticipantService = PrmService.participants;

interface IDeduplicationService {
  getDuplicatesForParticipant: (
    participant: Partial<Participant>,
  ) => Promise<DeduplicationRecord[]>;
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
  listDuplicates: () => Promise<DeduplicationRecord[]>;
  checkDuplicatesWithinList: (
    participants: Participant[],
  ) => Promise<DeduplicationRecord[]>;
}

// Compare two participants
const compareParticipants = (
  participantA: Partial<Participant>,
  participantB: Participant,
): DeduplicationRecord => {
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
): Promise<DeduplicationRecord[]> => {
  const getDuplicatesForParticipantIdBatch = async (
    startIndex: number,
  ): Promise<DeduplicationRecord[]> => {
    const participants = await ParticipantService.list({
      startIndex,
      limit: batchSize,
    });
    return participants.map((participantB) =>
      compareParticipants(participantA, participantB),
    );
  };

  const results: DeduplicationRecord[] = [];
  const totalParticipants = await ParticipantService.count();
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
  ): Promise<DeduplicationRecord[]> => {
    const participants = await ParticipantService.list({
      startIndex,
      limit: batchSize,
    });
    return participants.flatMap((participantA) =>
      participants.map((participantB) =>
        compareParticipants(participantA, participantB),
      ),
    );
  };

  const totalParticipants = await ParticipantService.count();
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

  const participant = await ParticipantService.update(
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
const listDuplicates = async (): Promise<DeduplicationRecord[]> => {
  return DeduplicationStore.list();
};

// Used for checking duplicates within a file
const checkDuplicatesWithinList = async (
  participants: Participant[],
): Promise<DeduplicationRecord[]> => {
  const records: DeduplicationRecord[] = [];
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

export const DeduplicationService: IDeduplicationService = {
  getDuplicatesForParticipant,
  compareAllParticipants,
  mergeDuplicate,
  ignoreDuplicate,
  listDuplicates,
  checkDuplicatesWithinList,
};

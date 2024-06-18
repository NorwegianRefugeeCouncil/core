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
import { getLogger } from '@nrcno/core-logger';

import * as DeduplicationStore from './deduplication.store';
import { config, totalWeight } from './config';

const cutoff = 0.1;
const processingBatchSize = 1_000;
const dbBatchSize = 1_000;
const batchSize = 1_000;

const participantService = new ParticipantService();

interface IDeduplicationService {
  getDuplicatesForParticipant: (
    participant: Partial<Participant>,
  ) => Promise<DeduplicationRecordDefinition[]>;
  compareAllParticipants: (fromDate: Date) => Promise<void>;
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
  countDuplicates: () => Promise<number>;
}

// TODO remove when DB is implemented
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

// TODO refactor to use DB
// Used for finding duplicates when inputting a new participant
const getDuplicatesForParticipant = async (
  participantA: Partial<Participant>,
): Promise<DeduplicationRecordDefinition[]> => {
  throw new Error('Not implemented');
  /*
  const getDuplicatesForParticipantIdBatch = async (
    startIndex: number,
  ): Promise<DeduplicationRecordDefinition[]> => {
    const participants = await participantService.listFull({
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
  */
};

const compareAllParticipants = async (fromDate: Date) => {
  const logger = getLogger();

  const processDuplicateRecordBatch = async (
    idx: number,
    batch: DeduplicationRecordDefinition[],
  ) => {
    logger.info(`[Batch ${idx}] Upserting ${batch.length} records...`);
    await DeduplicationStore.upsert(batch);
  };

  logger.info('Starting deduplication process...');

  logger.info('Preparing deduplication store...');
  await DeduplicationStore.prepareViews();

  logger.info('Fetching exact matches...');
  let exactIdx = 0;
  let exactBatch: DeduplicationRecordDefinition[] = [];
  for await (const exactDuplicate of DeduplicationStore.getExactMatches(
    fromDate,
  )) {
    exactBatch.push(exactDuplicate);
    if (exactBatch.length >= dbBatchSize) {
      exactIdx++;
      await processDuplicateRecordBatch(exactIdx, exactBatch);
      exactBatch = [];
    }
  }
  if (exactBatch.length > 0) {
    exactIdx++;
    await processDuplicateRecordBatch(exactIdx, exactBatch);
    exactBatch = [];
  }

  logger.info('Calculating weighted scores...');
  let weightedIdx = 0;
  let weightedBatch = [];
  const participantCount = await participantService.count();
  const totalBatches = Math.ceil(participantCount / batchSize);
  for (let i = 0; i < totalBatches; i++) {
    logger.info(`Processing batch ${i + 1} of ${totalBatches}...`);
    const pagination: Pagination = {
      startIndex: i * batchSize,
      pageSize: batchSize,
    };
    for await (const record of DeduplicationStore.getWeightedMatches(
      fromDate,
      pagination,
    )) {
      const duplicateRecord = {
        participantIdA: record.participant_id_a,
        participantIdB: record.participant_id_b,
        weightedScore: 0,
        scores: {
          name: {
            raw: record.name_score || 0,
            weighted: (record.name_score || 0) * config.name.weight,
          },
          email: {
            raw: record.email_score || 0,
            weighted: (record.email_score || 0) * config.email.weight,
          },
          residence: {
            raw: record.residence_score || 0,
            weighted: (record.residence_score || 0) * config.residence.weight,
          },
          dateOfBirth: {
            raw: record.dob_score || 0,
            weighted: (record.dob_score || 0) * config.dateOfBirth.weight,
          },
        },
      };
      duplicateRecord.weightedScore =
        Object.values(duplicateRecord.scores).reduce(
          (acc, { weighted }) => acc + weighted,
          0,
        ) / totalWeight;

      if (duplicateRecord.weightedScore > cutoff)
        weightedBatch.push(duplicateRecord);

      if (weightedBatch.length >= dbBatchSize) {
        weightedIdx++;
        await processDuplicateRecordBatch(weightedIdx, weightedBatch);
        weightedBatch = [];
      }
    }
  }
  if (weightedBatch.length > 0) {
    weightedIdx++;
    await processDuplicateRecordBatch(weightedIdx, weightedBatch);
    weightedBatch = [];
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

  const emptyParticipant: Participant = {
    id: duplicateParticipantId,
    firstName: `Duplicate of ${participantId}`,
    consentGdpr: false,
    consentReferral: false,
    languages: [],
    nationalities: [],
    identification: [],
    contactDetails: {
      emails: [],
      phones: [],
    },
  };
  await participantService.update(duplicateParticipantId, emptyParticipant);
  // TODO: Implement participant delete
  // await participantService.del(duplicateParticipantId);

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

// TODO refactor to use DB
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

const countDuplicates = async (): Promise<number> => {
  return DeduplicationStore.count();
};

export const DeduplicationService: IDeduplicationService = {
  getDuplicatesForParticipant,
  compareAllParticipants,
  mergeDuplicate,
  ignoreDuplicate,
  listDuplicates,
  checkDuplicatesWithinList,
  denormaliseDuplicateRecords,
  countDuplicates,
};

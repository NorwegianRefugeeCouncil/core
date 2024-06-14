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
};

// Used for the worker to calculate existing duplicates
const __compareAllParticipants = async (): Promise<void> => {
  const getDuplicatesForParticipantIdBatch = async (
    startIndex: number,
  ): Promise<DeduplicationRecordDefinition[]> => {
    const participants = await participantService.listFull({
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
  await DeduplicationStore.createParticipantIdentificationMatches();

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

  let weightedIdx = 0;
  let weightedBatch = [];

  const participantCount = await participantService.count();
  const totalBatches = Math.ceil(participantCount / batchSize);
  for (let i = 0; i < totalBatches; i++) {
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
            raw: record.name_score,
            weighted: record.name_score * config.name.weight,
          },
          email: {
            raw: record.email_score,
            weighted: record.email_score * config.email.weight,
          },
          residence: {
            raw: record.residence_score,
            weighted: record.residence_score * config.residence.weight,
          },
          dateOfBirth: {
            raw: record.dob_score,
            weighted: record.dob_score * config.dateOfBirth.weight,
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
    if (weightedBatch.length > 0) {
      weightedIdx++;
      await processDuplicateRecordBatch(weightedIdx, weightedBatch);
      weightedBatch = [];
    }
  }
};

const ___compareAllParticipants = async (fromDate: Date) => {
  const logger = getLogger();

  const processDuplicateRecordBatch = async (
    idx: number,
    batch: DeduplicationRecordDefinition[],
  ) => {
    logger.info(`[Batch ${idx}] Upserting ${batch.length} records...`);
    await DeduplicationStore.upsert(batch);
  };

  const processPairBatch = async (
    idx: number,
    idPairBatch: [string, string][],
  ) => {
    const uniqueIds = new Set<string>(idPairBatch.flat());

    const participants = await participantService.listFullIds(
      Array.from(uniqueIds),
    );
    const participantMap = participants.reduce<Record<string, Participant>>(
      (acc, p) => ({
        ...acc,
        [p.id]: p,
      }),
      {},
    );

    const results = idPairBatch
      .map(([participantIdA, participantIdB]) => {
        const participantA = participantMap[participantIdA];
        const participantB = participantMap[participantIdB];
        return compareParticipants(participantA, participantB);
      })
      .filter(
        (r): r is DeduplicationRecordDefinition =>
          r !== null && r.weightedScore > cutoff,
      );

    logger.info(`[Batch ${idx}] ${results.length}/${idPairBatch.length}`);

    return results;
  };

  logger.info('Starting deduplication process...');

  logger.info('Preparing deduplication store...');
  await DeduplicationStore.createParticipantIdentificationMatches();

  for await (const record of DeduplicationStore.getWeightedMatches(fromDate, {
    startIndex: 0,
    pageSize: 1000000000,
  })) {
    logger.info(record);
  }

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

  logger.info('Fetching participant id pairs...');
  let idPairIdx = 0;
  let weightedIdx = 0;
  const processedSet = new Set<string>();
  let idPairBatch: [string, string][] = [];
  let duplicateRecordBatch: DeduplicationRecordDefinition[] = [];
  for await (const idPair of DeduplicationStore.getParticipantIdPairs(
    fromDate,
  )) {
    if (idPair[0] === idPair[1]) continue;
    if (
      processedSet.has(idPair[0] + idPair[1]) ||
      processedSet.has(idPair[1] + idPair[0])
    ) {
      processedSet.delete(idPair[0] + idPair[1]);
      processedSet.delete(idPair[1] + idPair[0]);
      continue;
    }
    processedSet.add(idPair[0] + idPair[1]);

    idPairBatch.push(idPair);

    if (idPairBatch.length >= processingBatchSize) {
      idPairIdx++;
      const results = await processPairBatch(idPairIdx, idPairBatch);
      duplicateRecordBatch.push(...results);

      if (duplicateRecordBatch.length >= dbBatchSize) {
        weightedIdx++;
        await processDuplicateRecordBatch(weightedIdx, duplicateRecordBatch);
        duplicateRecordBatch = [];
      }

      idPairBatch = [];
    }
  }
  if (idPairBatch.length > 0) {
    idPairIdx++;
    const results = await processPairBatch(idPairIdx, idPairBatch);
    duplicateRecordBatch.push(...results);
    idPairBatch = [];
  }
  if (duplicateRecordBatch.length > 0) {
    weightedIdx++;
    await processDuplicateRecordBatch(weightedIdx, duplicateRecordBatch);
    duplicateRecordBatch = [];
  }
  logger.info('Deduplication process completed');
};

// WIP: Fixed version of compareAllParticipants
const _compareAllParticipants = async () => {
  const logger = getLogger();

  const totalParticipants = await participantService.count();
  const batches = Math.ceil(totalParticipants / batchSize);

  const doneSet = new Set<string>();

  for (let i = 0; i < batches; i++) {
    logger.info(`Processing batch ${i + 1} of ${batches}...`);
    const outerStartIdx = i * batchSize;
    const outerParticipants = await participantService.listFull({
      startIndex: outerStartIdx,
      pageSize: batchSize,
    });
    for (let j = 0; j < batches; j++) {
      logger.info(`Processing inner batch ${j + 1} of ${batches}...`);
      const innerStartIdx = j * batchSize;
      const innerParticipants = await participantService.listFull({
        startIndex: innerStartIdx,
        pageSize: batchSize,
      });
      for (const participantA of outerParticipants) {
        const results = innerParticipants
          .map((participantB) => {
            if (participantA.id === participantB.id) return null;
            if (
              doneSet.has(participantA.id + participantB.id) ||
              doneSet.has(participantB.id + participantA.id)
            )
              return null;
            doneSet.add(participantA.id + participantB.id);
            return compareParticipants(participantA, participantB);
          })
          .filter(
            (r): r is DeduplicationRecordDefinition =>
              r !== null && r.weightedScore > cutoff,
          );
        if (results.length > 0) {
          await DeduplicationStore.upsert(results);
        }
      }
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

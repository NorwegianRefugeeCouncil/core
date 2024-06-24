import {
  Individual,
  DeduplicationRecord,
  ScoringMechanism,
  DeduplicationRecordDefinition,
  DenormalisedDeduplicationRecord,
  DenormalisedDeduplicationRecordSchema,
  Pagination,
} from '@nrcno/core-models';
import { IndividualService } from '@nrcno/core-prm-engine';
import { getLogger } from '@nrcno/core-logger';

import * as DeduplicationStore from './deduplication.store';
import { config, totalWeight } from './config';

const cutoff = 0.1;
const processingBatchSize = 1_000;
const dbBatchSize = 1_000;
const batchSize = 1_000;

const individualService = new IndividualService();

interface IDeduplicationService {
  getDuplicatesForIndividual: (
    individual: Partial<Individual>,
  ) => Promise<DeduplicationRecordDefinition[]>;
  compareAllIndividuals: (fromDate: Date) => Promise<void>;
  mergeDuplicate: (
    individualId: string,
    duplicateIndividualId: string,
    resolvedIndividual: Individual,
  ) => Promise<Individual>;
  ignoreDuplicate: (
    individualId: string,
    duplicateIndividualId: string,
  ) => Promise<void>;
  listDuplicates: (pagination: Pagination) => Promise<DeduplicationRecord[]>;
  checkDuplicatesWithinList: (
    individuals: Individual[],
  ) => Promise<DeduplicationRecordDefinition[]>;
  denormaliseDuplicateRecords: (
    duplicates: DeduplicationRecord[],
  ) => Promise<DenormalisedDeduplicationRecord[]>;
  countDuplicates: () => Promise<number>;
}

// TODO remove when DB is implemented
// Compare two individuals
const compareIndividuals = (
  individualA: Partial<Individual>,
  individualB: Individual,
): DeduplicationRecordDefinition => {
  const scores: DeduplicationRecord['scores'] = Object.entries(config).reduce(
    (acc, [key, { score, weight }]) => {
      const s = score(individualA, individualB);
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
    individualIdA: individualA.id,
    individualIdB: individualB.id,
    weightedScore,
    scores,
  };
};

// TODO refactor to use DB
// Used for finding duplicates when inputting a new individual
const getDuplicatesForIndividual = async (
  individualA: Partial<Individual>,
): Promise<DeduplicationRecordDefinition[]> => {
  throw new Error('Not implemented');
  /*
  const getDuplicatesForIndividualIdBatch = async (
    startIndex: number,
  ): Promise<DeduplicationRecordDefinition[]> => {
    const individuals = await individualService.listFull({
      startIndex,
      pageSize: batchSize,
    });
    return individuals.map((individualB) =>
      compareIndividuals(individualA, individualB),
    );
  };

  const results: DeduplicationRecordDefinition[] = [];
  const totalIndividuals = await individualService.count();
  const batches = Math.ceil(totalIndividuals / batchSize);

  for (let i = 0; i < batches; i++) {
    const startIdx = i * batchSize;
    const records = await getDuplicatesForIndividualIdBatch(startIdx);
    for (const record of records) {
      if (record.weightedScore > cutoff) {
        results.push(record);
      }
    }
  }

  return results.sort((a, b) => b.weightedScore - a.weightedScore);
  */
};

const compareAllIndividuals = async (fromDate: Date) => {
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
  const individualCount = await individualService.count();
  const totalBatches = Math.ceil(individualCount / batchSize);
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
        individualIdA: record.individual_id_a,
        individualIdB: record.individual_id_b,
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
  individualId: string,
  duplicateIndividualId: string,
  resolvedIndividual: Individual,
): Promise<Individual> => {
  await DeduplicationStore.deletePair(individualId, duplicateIndividualId);
  await DeduplicationStore.logResolution(
    individualId,
    duplicateIndividualId,
    'merge',
  );

  const emptyIndividual: Individual = {
    id: duplicateIndividualId,
    firstName: `Duplicate of ${individualId}`,
    consentGdpr: false,
    consentReferral: false,
    languages: [],
    nationalities: [],
    identification: [],
    emails: [],
    phones: [],
  };
  await individualService.update(duplicateIndividualId, emptyIndividual);
  // TODO: Implement individual delete
  // await individualService.del(duplicateIndividualId);

  const individual = await individualService.update(
    individualId,
    resolvedIndividual,
  );

  if (!individual) {
    throw new Error('Individual not found');
  }

  return individual;
};

// Used for resolving duplicates
const ignoreDuplicate = async (
  individualId: string,
  duplicateIndividualId: string,
): Promise<void> => {
  await DeduplicationStore.deletePair(individualId, duplicateIndividualId);
  await DeduplicationStore.logResolution(
    individualId,
    duplicateIndividualId,
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
  individuals: Individual[],
): Promise<DeduplicationRecordDefinition[]> => {
  const records: DeduplicationRecordDefinition[] = [];
  for (const individualA of individuals) {
    for (const individualB of individuals) {
      if (individualA.id === individualB.id) continue;
      const record = compareIndividuals(individualA, individualB);
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
  const individualIds = duplicates
    .flatMap((d) => [d.individualIdA, d.individualIdB])
    .filter((id): id is string => id !== null && id !== undefined);
  const individualsMap = (
    await Promise.all(individualIds.map((id) => individualService.get(id)))
  ).reduce<Record<string, Individual>>(
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
      individualA: d.individualIdA ? individualsMap[d.individualIdA] : null,
      individualB: individualsMap[d.individualIdB],
    }),
  );
};

const countDuplicates = async (): Promise<number> => {
  return DeduplicationStore.count();
};

export const DeduplicationService: IDeduplicationService = {
  getDuplicatesForIndividual,
  compareAllIndividuals,
  mergeDuplicate,
  ignoreDuplicate,
  listDuplicates,
  checkDuplicatesWithinList,
  denormaliseDuplicateRecords,
  countDuplicates,
};

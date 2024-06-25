import { v4 as uuidv4 } from 'uuid';

import {
  Individual,
  DeduplicationRecord,
  ScoringMechanism,
  DeduplicationRecordDefinition,
  DenormalisedDeduplicationRecord,
  DenormalisedDeduplicationRecordSchema,
  Pagination,
  PaginatedResponse,
  IndividualDefinition,
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

const writeDuplicateRecords = async (
  result: AsyncGenerator<DeduplicationRecord, void, unknown>,
) => {
  const records: DeduplicationRecord[] = [];
  for await (const record of result) {
    records.push(record);
    if (records.length >= processingBatchSize) {
      await DeduplicationStore.upsert(records);
      records.length = 0;
    }
  }
  if (records.length > 0) {
    await DeduplicationStore.upsert(records);
  }
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

const compareAllIndividuals = async (
  fromDate: Date,
  checkList?: Individual[],
): Promise<DeduplicationRecordDefinition[]> => {
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
  const exactMatches: DeduplicationRecordDefinition[] = [];
  for await (const exactDuplicate of DeduplicationStore.getExactMatches(
    fromDate,
  )) {
    exactMatches.push(exactDuplicate);
  }

  logger.info('Calculating weighted scores...');
  const weightedMatches: DeduplicationRecordDefinition[] = [];
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
          address: {
            raw: record.address_score || 0,
            weighted: (record.address_score || 0) * config.address.weight,
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
        weightedMatches.push(duplicateRecord);
    }
  }

  return [...exactMatches, ...weightedMatches].sort(
    (a, b) => b.weightedScore - a.weightedScore,
  );
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
  fromDate: Date,
  individuals: Individual[],
): Promise<DeduplicationRecordDefinition[]> => {
  return compareAllIndividuals(fromDate, individuals);
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

class DS {
  public getDuplicatesForIndividual = async (
    individual:
      | Individual
      | IndividualDefinition
      | (Individual | IndividualDefinition)[],
  ): Promise<DeduplicationRecordDefinition[]> => {
    const tempTableId = uuidv4();
    await DeduplicationStore.prepareTempIndividualTables(
      [individual].flat(),
      tempTableId,
    );
    await DeduplicationStore.prepareViews(tempTableId);
    return this.getDuplicates(
      undefined,
      Array.isArray(individual) ? individual : [individual],
    );
  };

  public processDuplicatesSinceLastRun = async () => {
    const lastRunDate = await this.getLastRunDate();
    await DeduplicationStore.prepareViews();
    const duplicates = await this.getDuplicates(lastRunDate);
    await this.writeDuplicateRecords(duplicates);
  };

  public denormaliseDuplicateRecords = async (
    duplicates: DeduplicationRecord[],
  ) => {
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

  public mergeDuplicate = async (
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

  public ignoreDuplicate = async (
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

  public listDuplicates = async (
    pagination: Pagination,
  ): Promise<DeduplicationRecord[]> => {
    return DeduplicationStore.list(pagination);
  };

  public countDuplicates = async (): Promise<number> => {
    return DeduplicationStore.count();
  };

  private getLastRunDate = async (): Promise<Date> => {
    throw new Error('Not implemented');
  };

  private async *getDuplicates(
    fromDate?: Date,
    individuals?: Individual[],
    tempTableId?: string,
  ): AsyncGenerator<DeduplicationRecordDefinition, void, unknown> {
    for await (const exactMatch of DeduplicationStore.getExactMatches(
      fromDate,
      tempTableId,
    )) {
      yield exactMatch;
    }

    const individualCount = await individualService.count();
    const totalBatches = Math.ceil(individualCount / batchSize);
    for (let i = 0; i < totalBatches; i++) {
      const pagination: Pagination = {
        startIndex: i * batchSize,
        pageSize: batchSize,
      };
      for await (const record of DeduplicationStore.getWeightedMatches(
        fromDate,
        pagination,
        tempTableId
        Boolean(individuals),
        false,
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
            address: {
              raw: record.address_score || 0,
              weighted: (record.address_score || 0) * config.address.weight,
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

        if (duplicateRecord.weightedScore > cutoff) yield duplicateRecord;
      }
    }
  }

  private writeDuplicateRecords = async (
    records: DeduplicationRecordDefinition[],
  ) => {
    await DeduplicationStore.upsert(records);
  };
}

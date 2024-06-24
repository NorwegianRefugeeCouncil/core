import { AxiosInstance } from 'axios';
import { z } from 'zod';

import {
  DeduplicationRecord,
  DeduplicationRecordSchema,
  DenormalisedDeduplicationRecord,
  DenormalisedDeduplicationRecordSchema,
  PaginatedResponse,
  Pagination,
  Individual,
  IndividualSchema,
  createPaginatedResponseSchema,
} from '@nrcno/core-models';

import { BaseClient } from './base.client';

export class DeduplicationClient extends BaseClient {
  constructor(instance: AxiosInstance) {
    super(instance);
  }

  public check = async (
    individual: Partial<Individual>,
  ): Promise<DeduplicationRecord[]> => {
    const response = await this.post('/deduplication/check', individual);
    const data = z
      .object({
        duplicates: z.array(DeduplicationRecordSchema),
      })
      .parse(response.data);
    return data.duplicates;
  };

  public merge = async (
    individualIdA: string,
    individualIdB: string,
    resolvedIndividual: Individual,
  ): Promise<Individual> => {
    const response = await this.post('/deduplication/merge', {
      individualIdA,
      individualIdB,
      resolvedIndividual,
    });
    return IndividualSchema.parse(response.data);
  };

  public ignore = async (
    individualIdA: string,
    individualIdB: string,
  ): Promise<void> => {
    await this.post('/deduplication/ignore', {
      individualIdA,
      individualIdB,
    });
  };

  public list = async (
    pagination: Pagination,
  ): Promise<PaginatedResponse<DenormalisedDeduplicationRecord>> => {
    const paginationSchema = createPaginatedResponseSchema(
      DenormalisedDeduplicationRecordSchema,
    );
    const response = await this.get('/deduplication', {
      params: pagination,
    });
    return paginationSchema.parse(response.data);
  };
}

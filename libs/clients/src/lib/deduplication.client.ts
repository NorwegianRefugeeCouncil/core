import { AxiosInstance } from 'axios';
import { z } from 'zod';

import {
  DeduplicationRecord,
  DeduplicationRecordSchema,
  DenormalisedDeduplicationRecord,
  DenormalisedDeduplicationRecordSchema,
  PaginatedResponse,
  Pagination,
  Participant,
  ParticipantSchema,
  createPaginatedResponseSchema,
} from '@nrcno/core-models';

import { BaseClient } from './base.client';

export class DeduplicationClient extends BaseClient {
  constructor(instance: AxiosInstance) {
    super(instance);
  }

  public check = async (
    participant: Partial<Participant>,
  ): Promise<DeduplicationRecord[]> => {
    const response = await this.post('/deduplication/check', participant);
    const data = z
      .object({
        duplicates: z.array(DeduplicationRecordSchema),
      })
      .parse(response.data);
    return data.duplicates;
  };

  public merge = async (
    participantIdA: string,
    participantIdB: string,
    resolvedParticipant: Participant,
  ): Promise<Participant> => {
    const response = await this.post('/deduplication/merge', {
      participantIdA,
      participantIdB,
      resolvedParticipant,
    });
    return ParticipantSchema.parse(response.data);
  };

  public ignore = async (
    participantIdA: string,
    participantIdB: string,
  ): Promise<void> => {
    await this.post('/deduplication/ignore', {
      participantIdA,
      participantIdB,
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

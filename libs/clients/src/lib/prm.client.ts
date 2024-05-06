import { AxiosInstance } from 'axios';
import { z } from 'zod';

import {
  EntityType,
  PaginatedResponse,
  Pagination,
  Participant,
  ParticipantDefinition,
  ParticipantListItem,
  createPaginatedResponseSchema,
  getEntityListItemSchema,
  getEntitySchema,
} from '@nrcno/core-models';

import { BaseClient } from './base.client';

type PrmEntityClient<T, U, V> = {
  create: (entity: T) => Promise<U>;
  read: (id: string) => Promise<U>;
  update: (id: string, entity: Partial<U>) => Promise<U>;
  list: (pagination: Pagination) => Promise<PaginatedResponse<V>>;
};

const getPrmClient = (axiosInstance: AxiosInstance) => {
  function _getPrmClient(
    entityType: EntityType.Participant,
  ): PrmEntityClient<ParticipantDefinition, Participant, ParticipantListItem>;

  function _getPrmClient(
    entityType: EntityType,
  ): PrmEntityClient<any, any, any> {
    const baseClient = new BaseClient(axiosInstance);

    const entitySchema = getEntitySchema(entityType);
    const entityListPaginationSchema = createPaginatedResponseSchema(
      getEntityListItemSchema(entityType),
    );

    const create = async (entityDefinition: any) => {
      const response = await baseClient.post(
        `/prm/${entityType}`,
        entityDefinition,
      );
      return entitySchema.parse(response.data);
    };

    const read = async (id: string) => {
      const response = await baseClient.get(`/prm/${entityType}/${id}`);
      return entitySchema.parse(response.data);
    };

    const update = async (id: string, entity: any) => {
      const response = await baseClient.put(`/prm/${entityType}/${id}`, entity);
      return entitySchema.parse(response.data);
    };

    const list = async (pagination: Pagination) => {
      const response = await baseClient.get(`/prm/${entityType}`, pagination);
      return entityListPaginationSchema.parse(response.data);
    };

    return { create, read, update, list };
  }

  return _getPrmClient;
};

export class PrmClient {
  private participantClient: PrmEntityClient<
    ParticipantDefinition,
    Participant,
    ParticipantListItem
  >;

  constructor(axiosInstance: AxiosInstance) {
    const prmClientFactory = getPrmClient(axiosInstance);
    this.participantClient = prmClientFactory(EntityType.Participant);
  }

  get [EntityType.Participant]() {
    return this.participantClient;
  }
}

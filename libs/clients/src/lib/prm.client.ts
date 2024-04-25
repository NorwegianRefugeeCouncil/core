import { AxiosInstance } from 'axios';

import {
  EntityType,
  Participant,
  ParticipantDefinition,
  ParticipantDefinitionSchema,
  ParticipantSchema,
} from '@nrcno/core-models';

import { BaseClient } from './base.client';

type PrmEntityClient<T, U> = {
  create: (entity: T) => Promise<U>;
  read: (id: string) => Promise<U>;
};

const validators = {
  [EntityType.Participant]: {
    definition: ParticipantDefinitionSchema,
    entity: ParticipantSchema,
  },
};

const getPrmClient = (axiosInstance: AxiosInstance) => {
  function _getPrmClient(
    entityType: EntityType.Participant,
  ): PrmEntityClient<ParticipantDefinition, Participant>;
  function _getPrmClient(entityType: EntityType): PrmEntityClient<any, any> {
    const baseClient = new BaseClient(axiosInstance);

    const create = async (entityDefinition: any) => {
      const validatedEntityDefinition =
        validators[entityType].definition.parse(entityDefinition);
      const response = await baseClient.post(
        `/prm/${entityType}`,
        validatedEntityDefinition,
      );
      return validators[entityType].entity.parse(response.data);
    };

    const read = async (id: string) => {
      const response = await baseClient.get(`/prm/${entityType}/${id}`);
      return validators[entityType].entity.parse(response.data);
    };

    return { create, read };
  }
  return _getPrmClient;
};

export class PrmClient {
  private participantClient: PrmEntityClient<
    ParticipantDefinition,
    Participant
  >;

  constructor(axiosInstance: AxiosInstance) {
    const prmClientFactory = getPrmClient(axiosInstance);
    this.participantClient = prmClientFactory(EntityType.Participant);
  }

  get [EntityType.Participant]() {
    return this.participantClient;
  }
}

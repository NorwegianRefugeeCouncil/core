import { AxiosInstance } from 'axios';

import {
  Participant,
  ParticipantDefinition,
  ParticipantDefinitionSchema,
  ParticipantSchema,
} from '@nrcno/core-models';

import { BaseClient, ClientConfig } from '../base.client';

export class ParticipantClient extends BaseClient {
  constructor(instance?: AxiosInstance, config?: ClientConfig) {
    super(instance, config);
  }

  create = async (
    participantDefinition: ParticipantDefinition,
  ): Promise<Participant> => {
    const validatedParticipantDefinition = ParticipantDefinitionSchema.parse(
      participantDefinition,
    );
    const response = await this.post(
      '/participants',
      validatedParticipantDefinition,
    );
    return ParticipantSchema.parse(response.data);
  };
}

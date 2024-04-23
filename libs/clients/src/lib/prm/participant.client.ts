import { Participant, ParticipantDefinition } from '@nrcno/core-models';

import { BaseClient, ClientConfig } from '../base.client';

export class ParticipantClient extends BaseClient {
  constructor({ baseURL }: ClientConfig) {
    super({ baseURL });
  }

  create = async (
    participantDefinition: ParticipantDefinition,
  ): Promise<Participant> => {
    throw new Error('Not implemented');
  };
}

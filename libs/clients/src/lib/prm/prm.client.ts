import { AxiosInstance } from 'axios';

import { ClientConfig } from '../base.client';

import { ParticipantClient } from './participant.client';

export class PrmClient {
  private participantClient: ParticipantClient;

  constructor(instance?: AxiosInstance, config?: ClientConfig) {
    this.participantClient = new ParticipantClient(instance, config);
  }

  get participant() {
    return this.participantClient;
  }
}

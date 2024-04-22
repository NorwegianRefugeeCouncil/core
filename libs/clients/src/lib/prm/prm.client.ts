import { ClientConfig } from '../base.client';

import { ParticipantClient } from './participant.client';

export class PrmClient {
  private participantClient: ParticipantClient;

  constructor({ baseURL }: ClientConfig<any>) {
    this.participantClient = new ParticipantClient({ baseURL });
  }

  get participant() {
    return this.participantClient;
  }
}

import { AxiosInstance } from 'axios';

import { EntityType } from '@nrcno/core-models';

import { ParticipantClient } from './participant.client';

export {
  hasCreateMixin,
  hasReadMixin,
  hasUpdateMixin,
  hasListMixin,
} from './prm-base.client';

export class PrmClient {
  private participantClient: ParticipantClient;

  constructor(axiosInstance: AxiosInstance) {
    this.participantClient = new ParticipantClient(axiosInstance);
  }

  get [EntityType.Participant]() {
    return this.participantClient;
  }
}

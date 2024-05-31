import { AxiosInstance } from 'axios';

import { EntityType } from '@nrcno/core-models';

import { LanguageClient } from './language.client';
import { ParticipantClient } from './participant.client';

export {
  hasCreateMixin,
  hasReadMixin,
  hasUpdateMixin,
  hasListMixin,
} from './prm-base.client';

export class PrmClient {
  private participantClient: ParticipantClient;

  private languageClient: LanguageClient;

  constructor(axiosInstance: AxiosInstance) {
    this.participantClient = new ParticipantClient(axiosInstance);
    this.languageClient = new LanguageClient(axiosInstance);
  }

  get [EntityType.Participant]() {
    return this.participantClient;
  }

  get [EntityType.Language]() {
    return this.languageClient;
  }
}

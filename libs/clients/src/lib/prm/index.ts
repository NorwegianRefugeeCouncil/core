import { AxiosInstance } from 'axios';

import { EntityType } from '@nrcno/core-models';

import { LanguageClient } from './language.client';
import { ParticipantClient } from './participant.client';
import { NationalityClient } from './nationality.client';

export {
  hasCreateMixin,
  hasReadMixin,
  hasUpdateMixin,
  hasListMixin,
} from './prm-base.client';

export class PrmClient {
  private participantClient: ParticipantClient;

  private languageClient: LanguageClient;

  private nationalityClient: NationalityClient;

  constructor(axiosInstance: AxiosInstance) {
    this.participantClient = new ParticipantClient(axiosInstance);
    this.languageClient = new LanguageClient(axiosInstance);
    this.nationalityClient = new NationalityClient(axiosInstance);
  }

  get [EntityType.Participant]() {
    return this.participantClient;
  }

  get [EntityType.Language]() {
    return this.languageClient;
  }

  get [EntityType.Nationality]() {
    return this.nationalityClient;
  }
}

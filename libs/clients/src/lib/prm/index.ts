import { AxiosInstance } from 'axios';

import { EntityType } from '@nrcno/core-models';

import { LanguageClient } from './language.client';
import { IndividualClient } from './individual';
import { NationalityClient } from './nationality.client';
import { HouseholdClient } from './household';

export {
  hasCreateMixin,
  hasReadMixin,
  hasUpdateMixin,
  hasListMixin,
} from './prm-base.client';

export class PrmClient {
  private householdClient: HouseholdClient;

  private individualClient: IndividualClient;

  private languageClient: LanguageClient;

  private nationalityClient: NationalityClient;

  constructor(axiosInstance: AxiosInstance) {
    this.householdClient = new HouseholdClient(axiosInstance);
    this.individualClient = new IndividualClient(axiosInstance);
    this.languageClient = new LanguageClient(axiosInstance);
    this.nationalityClient = new NationalityClient(axiosInstance);
  }

  get [EntityType.Household]() {
    return this.householdClient;
  }

  get [EntityType.Individual]() {
    return this.individualClient;
  }

  get [EntityType.Language]() {
    return this.languageClient;
  }

  get [EntityType.Nationality]() {
    return this.nationalityClient;
  }
}

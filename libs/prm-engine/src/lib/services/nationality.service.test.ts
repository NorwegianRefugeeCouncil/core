import { EntityType } from '@nrcno/core-models';

import { NationalityStore } from '../stores/nationality.store';

import { NationalityService } from './nationality.service';
import { buildCountTests, buildListTests } from './test-utils';

jest.mock('../stores/nationality.store', () => ({
  NationalityStore: {
    list: jest.fn(),
    count: jest.fn(),
  },
}));

describe('NationalityService', () => {
  buildListTests(EntityType.Nationality, NationalityService, NationalityStore);
  buildCountTests(EntityType.Nationality, NationalityService, NationalityStore);
});

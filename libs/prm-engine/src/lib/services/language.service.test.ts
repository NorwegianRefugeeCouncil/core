import { EntityType } from '@nrcno/core-models';

import { LanguageStore } from '../stores/language.store';

import { LanguageService } from './language.service';
import { buildCountTests, buildListTests } from './test-utils';

jest.mock('../stores/language.store', () => ({
  LanguageStore: {
    list: jest.fn(),
    count: jest.fn(),
  },
}));

describe('LanguageService', () => {
  buildListTests(EntityType.Language, LanguageService, LanguageStore);
  buildCountTests(EntityType.Language, LanguageService, LanguageStore);
});

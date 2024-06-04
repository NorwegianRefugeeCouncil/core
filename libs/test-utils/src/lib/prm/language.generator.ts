import { faker } from '@faker-js/faker';

import { Language } from '@nrcno/core-models';

const possibleLanguages = [
  'aaa',
  'aab',
  'aac',
  'aad',
  'aae',
  'aaf',
  'aag',
  'aah',
  'aai',
]; // this is a small subset of languages, but it's enough for testing

export const generateListItem = (overrides?: Partial<Language>): Language => {
  return {
    id: faker.helpers.arrayElement(possibleLanguages),
    enabled: faker.datatype.boolean(),
    ...overrides,
  };
};

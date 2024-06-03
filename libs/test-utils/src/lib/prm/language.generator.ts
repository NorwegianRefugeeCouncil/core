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
]; // TODO: use list of languages from db seed file

export const generateListItem = (overrides?: Partial<Language>): Language => {
  return {
    id: faker.helpers.arrayElement(possibleLanguages),
    enabled: faker.datatype.boolean(),
    ...overrides,
  };
};

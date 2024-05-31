import { faker } from '@faker-js/faker';

import { Language } from '@nrcno/core-models';

export const generateListItem = (overrides?: Partial<Language>): Language => {
  return {
    id: faker.location.countryCode(),
    enabled: faker.datatype.boolean(),
    ...overrides,
  };
};

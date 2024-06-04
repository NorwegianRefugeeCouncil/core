import { faker } from '@faker-js/faker';

import { Nationality } from '@nrcno/core-models';

export const generateListItem = (
  overrides?: Partial<Nationality>,
): Nationality => {
  return {
    id: faker.location.countryCode('alpha-3'),
    enabled: faker.datatype.boolean(),
    ...overrides,
  };
};

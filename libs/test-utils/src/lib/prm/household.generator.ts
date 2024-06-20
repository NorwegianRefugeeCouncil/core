import { faker } from '@faker-js/faker';
import { ulid } from 'ulidx';

import {
  HouseholdDefinition,
  Household,
  HeadOfHouseholdType,
  IdentificationType,
} from '@nrcno/core-models';

import { BaseTestEntityGenerator } from '../base-test-entity-generator';

const generateDefinition = (
  overrides?: Partial<HouseholdDefinition>,
): HouseholdDefinition => {
  return {
    sizeOverride: faker.number.int(),
    headType: faker.helpers.enumValue(HeadOfHouseholdType),
    individuals: [],
    ...overrides,
  };
};

const generateEntity = (overrides?: Partial<Household>): Household => {
  const definition = generateDefinition(overrides);

  return {
    ...definition,
    individuals: definition.individuals.map((individual, i) => {
      const phoneId =
        overrides?.individuals && overrides?.individuals[i].phone?.id;
      const identificationId =
        overrides?.individuals && overrides?.individuals[i].identification?.id;
      return {
        ...individual,
        id: faker.string.uuid(),
        phone: {
          value: individual.phone?.value || faker.string.alphanumeric(),
          id: phoneId || faker.string.uuid(),
        },
        identification: {
          identificationNumber:
            individual.identification?.identificationNumber ||
            faker.string.uuid(),
          identificationType:
            individual.identification?.identificationType ||
            faker.helpers.enumValue(IdentificationType),
          id: identificationId || faker.string.uuid(),
        },
      };
    }),
    headNationality: faker.location.countryCode('alpha-3'),
    id: overrides?.id || ulid(),
  };
};

export const HouseholdGenerator: BaseTestEntityGenerator<
  HouseholdDefinition,
  Household,
  any
> = {
  generateDefinition,
  generateEntity,
  generateListItem: () => [],
};

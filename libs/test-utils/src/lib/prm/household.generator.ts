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
    sizeOverride: faker.number.int({ max: 100 }),
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
        overrides?.individuals && overrides?.individuals[i].phones?.[0]?.id;
      const identificationId =
        overrides?.individuals &&
        overrides?.individuals[i].identification?.[0].id;
      return {
        ...individual,
        id: ulid(),
        phones: [
          {
            value: individual.phones?.[0]?.value || faker.string.alphanumeric(),
            id: phoneId || ulid(),
          },
        ],
        identification: [
          {
            identificationNumber:
              individual.identification?.[0]?.identificationNumber || ulid(),
            identificationType:
              individual.identification?.[0]?.identificationType ||
              faker.helpers.enumValue(IdentificationType),
            id: identificationId || ulid(),
          },
        ],
      };
    }),
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

import { faker } from '@faker-js/faker';
import { ulid } from 'ulidx';

import {
  HouseholdDefinition,
  Household,
  HeadOfHouseholdType,
  IdentificationType,
  HouseholdListItem,
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
        id: faker.string.uuid(),
        phones: [
          {
            value: individual.phones?.[0]?.value || faker.string.alphanumeric(),
            id: phoneId || faker.string.uuid(),
          },
        ],
        identification: [
          {
            identificationNumber:
              individual.identification?.[0]?.identificationNumber ||
              faker.string.uuid(),
            identificationType:
              individual.identification?.[0]?.identificationType ||
              faker.helpers.enumValue(IdentificationType),
            id: identificationId || faker.string.uuid(),
          },
        ],
      };
    }),
    id: overrides?.id || ulid(),
  };
};

const generateListItem = (): HouseholdListItem => {
  return {
    id: ulid(),
    headType: faker.helpers.enumValue(HeadOfHouseholdType),
    sizeOverride: faker.number.int(),
    individuals: [{ id: ulid(), isHeadOfHousehold: true }],
  };
};

export const HouseholdGenerator: BaseTestEntityGenerator<
  HouseholdDefinition,
  Household,
  HouseholdListItem
> = {
  generateDefinition,
  generateEntity,
  generateListItem,
};

import { faker } from '@faker-js/faker';

import {
  IdentificationDefinition,
  Identification,
  IdentificationType,
} from '@nrcno/core-models';

import { BaseTestEntityGenerator } from '../base-test-entity-generator';

const generateDefinition = (
  overrides?: Partial<IdentificationDefinition>,
): IdentificationDefinition => {
  return {
    identificationType: faker.helpers.enumValue(IdentificationType),
    identificationNumber: faker.string.alphanumeric(10),
    isPrimary: faker.datatype.boolean(),
    ...overrides,
  };
};

const generateEntity = (
  overrides?: Partial<Identification>,
): Identification => {
  const definition = generateDefinition(overrides);

  return {
    ...definition,
    id: overrides?.id || faker.string.uuid(),
  };
};

export const IdentificationGenerator: BaseTestEntityGenerator<
  IdentificationDefinition,
  Identification
> = {
  generateDefinition,
  generateEntity,
};

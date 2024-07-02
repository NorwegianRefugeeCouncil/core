import { faker } from '@faker-js/faker';
import { ulid } from 'ulidx';

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
    ...overrides,
  };
};

const generateEntity = (
  overrides?: Partial<Identification>,
): Identification => {
  const definition = generateDefinition(overrides);

  return {
    ...definition,
    id: overrides?.id || ulid(),
  };
};

export const IdentificationGenerator: BaseTestEntityGenerator<
  IdentificationDefinition,
  Identification,
  Identification
> = {
  generateDefinition,
  generateEntity,
  generateListItem: generateEntity,
};

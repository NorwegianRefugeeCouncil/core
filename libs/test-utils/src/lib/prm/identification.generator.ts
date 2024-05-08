import { faker } from '@faker-js/faker';

import {
  IdentificationDefinition,
  Identification,
  IdentificationType,
  ParticipantListItem,
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

type IdentificationListItem = Pick<
  ParticipantListItem,
  'primaryIdentificationType'
> &
  Pick<ParticipantListItem, 'primaryIdentificationNumber'>;
const generateListItem = (
  overrides?: Partial<IdentificationListItem>,
): IdentificationListItem => {
  const identification = generateEntity();
  return {
    primaryIdentificationType: identification.identificationType,
    primaryIdentificationNumber: identification.identificationNumber,
    ...overrides,
  };
};

export const IdentificationGenerator: BaseTestEntityGenerator<
  IdentificationDefinition,
  Identification,
  IdentificationListItem
> = {
  generateDefinition,
  generateEntity,
  generateListItem,
};

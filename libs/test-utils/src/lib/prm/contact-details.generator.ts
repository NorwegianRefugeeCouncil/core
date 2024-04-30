import { faker } from '@faker-js/faker';

import {
  ContactDetailType,
  ContactDetailsDefinition,
  ContactDetails,
} from '@nrcno/core-models';

import { BaseTestEntityGenerator } from '../base-test-entity-generator';

const generateDefinition = (
  overrides?: Partial<ContactDetailsDefinition>,
): ContactDetailsDefinition => {
  return {
    contactDetailType: faker.helpers.enumValue(ContactDetailType),
    value: faker.phone.number(),
    ...overrides,
  };
};

const generateEntity = (
  overrides?: Partial<ContactDetails>,
): ContactDetails => {
  const definition = generateDefinition(overrides);

  return {
    ...definition,
    id: overrides?.id || faker.string.uuid(),
  };
};

export const ContactDetailsGenerator: BaseTestEntityGenerator<
  ContactDetailsDefinition,
  ContactDetails
> = {
  generateDefinition,
  generateEntity,
};

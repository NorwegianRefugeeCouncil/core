import { faker } from '@faker-js/faker';
import { ulid } from 'ulidx';

import {
  IndividualDefinition,
  Sex,
  ContactMeans,
  DisplacementStatus,
  EngagementContext,
  Individual,
  IndividualListItem,
} from '@nrcno/core-models';

import { BaseTestEntityGenerator } from '../base-test-entity-generator';

import { IdentificationGenerator } from './identification.generator';
import * as LanguageGenerator from './language.generator';

const generateDefinition = (
  overrides?: Partial<IndividualDefinition>,
): IndividualDefinition => {
  const pastDate = faker.date.past();
  const pastDateWithoutTime = new Date(
    pastDate.getFullYear(),
    pastDate.getMonth(),
    pastDate.getDate(),
  );
  const recentDate = faker.date.recent();
  const dateOfRegistration = new Date(
    recentDate.getFullYear(),
    recentDate.getMonth(),
    recentDate.getDate(),
  );
  const languageId = LanguageGenerator.generateListItem().id;

  return {
    firstName: faker.person.firstName(),
    middleName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    nativeName: faker.person.firstName(),
    motherName: faker.person.lastName(),
    preferredName: faker.person.firstName(),
    prefersToRemainAnonymous: faker.datatype.boolean(),
    dateOfBirth: pastDateWithoutTime,
    nrcId: faker.string.alphanumeric(),
    preferredLanguage: languageId,
    address: faker.location.streetAddress(),
    contactMeansComment: faker.lorem.sentence(),
    consentGdpr: faker.datatype.boolean(),
    consentReferral: faker.datatype.boolean(),
    sex: faker.helpers.enumValue(Sex),
    preferredContactMeans: faker.helpers.enumValue(ContactMeans),
    displacementStatus: faker.helpers.enumValue(DisplacementStatus),
    engagementContext: faker.helpers.enumValue(EngagementContext),
    dateOfRegistration,
    languages: [languageId],
    nationalities: [faker.location.countryCode('alpha-3')],
    emails: [
      {
        value: faker.internet.email(),
      },
    ],
    phones: [
      {
        value: faker.phone.number(),
      },
    ],
    identification: [IdentificationGenerator.generateDefinition()],
    isHeadOfHousehold: false,
    ...overrides,
  };
};

const generateEntity = (overrides?: Partial<Individual>): Individual => {
  const definition = generateDefinition(overrides);

  return {
    ...definition,
    id: overrides?.id || ulid(),
    emails:
      definition.emails?.map((contactDetail, index) => ({
        ...contactDetail,
        id: overrides?.emails?.[index]?.id || faker.string.uuid(),
      })) || [],
    phones:
      definition.phones?.map((contactDetail, index) => ({
        ...contactDetail,
        id: overrides?.phones?.[index]?.id || faker.string.uuid(),
      })) || [],
    identification:
      definition.identification?.map((identification, index) => ({
        ...identification,
        id: overrides?.identification?.[index]?.id || faker.string.uuid(),
      })) || [],
    languages: definition.languages,
    nationalities: definition.nationalities,
    householdId: overrides?.householdId || ulid(),
  };
};

const generateEntityFromDefinition = (
  overrides?: Partial<IndividualDefinition>,
): Individual => {
  const definition = generateDefinition(overrides);

  return {
    ...definition,
    id: ulid(),
    emails:
      definition.emails?.map((contactDetail) => ({
        ...contactDetail,
        id: faker.string.uuid(),
      })) || [],
    phones:
      definition.phones?.map((contactDetail) => ({
        ...contactDetail,
        id: faker.string.uuid(),
      })) || [],
    identification:
      definition.identification?.map((identification) => ({
        ...identification,
        id: faker.string.uuid(),
      })) || [],
    languages: definition.languages,
    nationalities: definition.nationalities,
    householdId: overrides?.householdId || ulid(),
  };
};

const generateListItem = (
  overrides?: Partial<IndividualListItem>,
): IndividualListItem => {
  return {
    id: ulid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    dateOfBirth: faker.date.past(),
    sex: faker.helpers.enumValue(Sex),
    displacementStatus: faker.helpers.enumValue(DisplacementStatus),
    nationalities: [faker.location.countryCode('alpha-3')],
    emails: [{ value: faker.internet.email(), id: faker.string.uuid() }],
    phones: [{ value: faker.phone.number(), id: faker.string.uuid() }],
    identification: [IdentificationGenerator.generateListItem()],
    ...overrides,
  };
};

export const IndividualGenerator: BaseTestEntityGenerator<
  IndividualDefinition,
  Individual,
  IndividualListItem
> = {
  generateDefinition,
  generateEntity,
  generateListItem,
  generateEntityFromDefinition,
};

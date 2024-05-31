import { faker } from '@faker-js/faker';
import { ulid } from 'ulidx';

import {
  ParticipantDefinition,
  Sex,
  ContactMeans,
  DisplacementStatus,
  EngagementContext,
  DisabilityLevel,
  YesNoUnknown,
  Participant,
  ParticipantListItem,
} from '@nrcno/core-models';

import { BaseTestEntityGenerator } from '../base-test-entity-generator';

import { IdentificationGenerator } from './identification.generator';

const generateDefinition = (
  overrides?: Partial<ParticipantDefinition>,
): ParticipantDefinition => {
  const pastDate = faker.date.past();
  const pastDateWithoutTime = new Date(
    pastDate.getFullYear(),
    pastDate.getMonth(),
    pastDate.getDate(),
  );

  return {
    firstName: faker.person.firstName(),
    middleName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    nativeName: faker.person.firstName(),
    motherName: faker.person.lastName(),
    preferredName: faker.person.firstName(),
    dateOfBirth: pastDateWithoutTime,
    nrcId: faker.string.alphanumeric(),
    residence: faker.location.streetAddress(),
    contactMeansComment: faker.lorem.sentence(),
    consentGdpr: faker.datatype.boolean(),
    consentReferral: faker.datatype.boolean(),
    sex: faker.helpers.enumValue(Sex),
    preferredContactMeans: faker.helpers.enumValue(ContactMeans),
    displacementStatus: faker.helpers.enumValue(DisplacementStatus),
    engagementContext: faker.helpers.enumValue(EngagementContext),
    disabilities: {
      hasDisabilityPwd: faker.datatype.boolean(),
      disabilityPwdComment: faker.lorem.sentence(),
      hasDisabilityVision: faker.datatype.boolean(),
      disabilityVisionLevel: faker.helpers.enumValue(DisabilityLevel),
      hasDisabilityHearing: faker.datatype.boolean(),
      disabilityHearingLevel: faker.helpers.enumValue(DisabilityLevel),
      hasDisabilityMobility: faker.datatype.boolean(),
      disabilityMobilityLevel: faker.helpers.enumValue(DisabilityLevel),
      hasDisabilityCognition: faker.datatype.boolean(),
      disabilityCognitionLevel: faker.helpers.enumValue(DisabilityLevel),
      hasDisabilitySelfcare: faker.datatype.boolean(),
      disabilitySelfcareLevel: faker.helpers.enumValue(DisabilityLevel),
      hasDisabilityCommunication: faker.datatype.boolean(),
      disabilityCommunicationLevel: faker.helpers.enumValue(DisabilityLevel),
      isChildAtRisk: faker.helpers.enumValue(YesNoUnknown),
      isElderAtRisk: faker.helpers.enumValue(YesNoUnknown),
      isWomanAtRisk: faker.helpers.enumValue(YesNoUnknown),
      isSingleParent: faker.helpers.enumValue(YesNoUnknown),
      isSeparatedChild: faker.helpers.enumValue(YesNoUnknown),
      isPregnant: faker.helpers.enumValue(YesNoUnknown),
      isLactating: faker.helpers.enumValue(YesNoUnknown),
      hasMedicalCondition: faker.helpers.enumValue(YesNoUnknown),
      needsLegalPhysicalProtection: faker.helpers.enumValue(YesNoUnknown),
      vulnerabilityComments: faker.lorem.sentence(),
    },
    languages: [faker.helpers.arrayElement(['aaa'])],
    nationalities: [faker.helpers.arrayElement(['AFG'])],
    contactDetails: {
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
    },
    identification: [IdentificationGenerator.generateDefinition()],
    ...overrides,
  };
};

const generateEntity = (overrides?: Partial<Participant>): Participant => {
  const definition = generateDefinition(overrides);

  return {
    ...definition,
    id: overrides?.id || ulid(),
    contactDetails: {
      emails: definition.contactDetails.emails.map((contactDetail, index) => ({
        ...contactDetail,
        id:
          overrides?.contactDetails?.emails?.[index]?.id || faker.string.uuid(),
      })),
      phones: definition.contactDetails.phones.map((contactDetail, index) => ({
        ...contactDetail,
        id:
          overrides?.contactDetails?.phones?.[index]?.id || faker.string.uuid(),
      })),
    },
    identification: definition.identification.map((identification, index) => ({
      ...identification,
      id: overrides?.identification?.[index]?.id || faker.string.uuid(),
    })),
    languages: definition.languages,
    nationalities: definition.nationalities,
  };
};

const generateListItem = (
  overrides?: Partial<ParticipantListItem>,
): ParticipantListItem => {
  return {
    id: ulid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    dateOfBirth: faker.date.past(),
    sex: faker.helpers.enumValue(Sex),
    displacementStatus: faker.helpers.enumValue(DisplacementStatus),
    nationalities: [faker.helpers.arrayElement(['en', 'es', 'fr', 'ar'])],
    contactDetails: {
      emails: [{ value: faker.internet.email(), id: faker.string.uuid() }],
      phones: [{ value: faker.phone.number(), id: faker.string.uuid() }],
    },
    identification: [IdentificationGenerator.generateListItem()],
    ...overrides,
  };
};

export const ParticipantGenerator: BaseTestEntityGenerator<
  ParticipantDefinition,
  Participant,
  ParticipantListItem
> = {
  generateDefinition,
  generateEntity,
  generateListItem,
};

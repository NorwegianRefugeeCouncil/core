import { faker } from '@faker-js/faker';

import {
  ParticipantDefinition,
  Sex,
  ContactMeans,
  DisplacementStatus,
  EngagementContext,
  DisabilityLevel,
  YesNoUnknown,
  ContactDetailType,
  IdentificationType,
} from '@nrcno/core-models';

import { BaseTestEntityGenerator } from '../base-test-entity-generator';

const generate = (
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
    languages: [
      {
        isoCode: faker.helpers.arrayElement(['en', 'es', 'fr', 'ar']),
      },
    ],
    nationalities: [
      {
        isoCode: faker.helpers.arrayElement(['en', 'es', 'fr', 'ar']),
      },
    ],
    contactDetails: [
      {
        contactDetailType: faker.helpers.enumValue(ContactDetailType),
        value: faker.phone.number(),
      },
    ],
    identification: [
      {
        identificationType: faker.helpers.enumValue(IdentificationType),
        identificationNumber: faker.string.alphanumeric(),
        isPrimary: faker.datatype.boolean(),
      },
    ],
    ...overrides,
  };
};

export const ParticipantGenerator: BaseTestEntityGenerator<ParticipantDefinition> =
  {
    generate,
  };

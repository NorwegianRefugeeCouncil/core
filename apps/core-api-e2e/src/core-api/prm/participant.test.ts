import axios from 'axios';
import { faker } from '@faker-js/faker';
import { ulid } from 'ulidx';

import {
  ParticipantSchema,
  ParticipantDefinition,
  Participant,
  Sex,
  ContactMeans,
  DisplacementStatus,
  EngagementContext,
  DisabilityLevel,
  YesNoUnknown,
  ContactDetailType,
  IdentificationType,
} from '@nrcno/core-models';

const axiosInstance = axios.create({
  validateStatus: () => true,
});

const participantDefinitionWithEveryField: ParticipantDefinition = {
  firstName: faker.person.firstName(),
  middleName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  nativeName: faker.person.firstName(),
  motherName: faker.person.lastName(),
  preferredName: faker.person.firstName(),
  dateOfBirth: faker.date.past(),
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
};

const participantWithEveryField: Participant = {
  ...participantDefinitionWithEveryField,
  id: expect.any(String),
  contactDetails: participantDefinitionWithEveryField.contactDetails.map(
    (contactDetail) => ({
      ...contactDetail,
      id: expect.any(String),
    }),
  ),
  identification: participantDefinitionWithEveryField.identification.map(
    (identification) => ({
      ...identification,
      id: expect.any(String),
    }),
  ),
  languages: participantDefinitionWithEveryField.languages.map((language) => ({
    ...language,
    translationKey: `language__${language.isoCode}`,
  })),
  nationalities: participantDefinitionWithEveryField.nationalities.map(
    (nationality) => ({
      ...nationality,
      translationKey: `nationality__${nationality.isoCode}`,
    }),
  ),
};

const participantDefinitionWithSomeFields: ParticipantDefinition = {
  consentGdpr: faker.datatype.boolean(),
  consentReferral: faker.datatype.boolean(),
  languages: [],
  nationalities: [],
  contactDetails: [],
  identification: [],
};

const participantWithSomeFields: Participant = {
  ...participantDefinitionWithSomeFields,
  id: expect.any(String),
  contactDetails: [],
  identification: [],
  languages: [],
  nationalities: [],
};

const participantDefinitionWithMissingRequiredFields = {
  consentReferral: faker.datatype.boolean(),
  languages: [],
  nationalities: [],
  contactDetails: [],
  identification: [],
};

const participantDefinitionWithInvalidFields = {
  sex: 'invalid',
  consentGdpr: faker.datatype.boolean(),
  consentReferral: faker.datatype.boolean(),
  languages: [],
  nationalities: [],
  contactDetails: [],
  identification: [],
};

const participantDefinitionWithIds = {
  ...participantDefinitionWithEveryField,
  id: ulid(),
  contactDetails: participantDefinitionWithEveryField.contactDetails.map(
    (contactDetail) => ({
      ...contactDetail,
      id: faker.string.uuid(),
    }),
  ),
  identification: participantDefinitionWithEveryField.identification.map(
    (identification) => ({
      ...identification,
      id: faker.string.uuid(),
    }),
  ),
};

describe('Participants', () => {
  describe('POST /api/prm/participants', () => {
    it('should create a participant with every field', async () => {
      const res = await axiosInstance.post(
        `/api/prm/participants`,
        participantDefinitionWithEveryField,
      );

      expect(res.status).toBe(201);
      expect(ParticipantSchema.parse(res.data)).toEqual(
        participantWithEveryField,
      );
    });

    it('should create a participant with some fields', async () => {
      const res = await axiosInstance.post(
        `/api/prm/participants`,
        participantDefinitionWithSomeFields,
      );

      expect(res.status).toBe(201);
      expect(ParticipantSchema.parse(res.data)).toEqual(
        participantWithSomeFields,
      );
    });

    // Enable with validation ticket
    it.skip('should return an error when creating a participant with missing required fields', async () => {
      const res = await axiosInstance.post(
        `/api/prm/participants`,
        participantDefinitionWithMissingRequiredFields,
      );

      expect(res.status).toBe(400);
      expect(res.data).toEqual({
        message: 'Validation Failed',
        errors: [
          {
            path: 'consentGdpr',
            message: 'Required',
          },
        ],
      });
    });

    // Enable with validation ticket
    it.skip('should return an error when creating a participant with invalid fields', async () => {
      const res = await axiosInstance.post(
        `/api/prm/participants`,
        participantDefinitionWithInvalidFields,
      );
      expect(res.status).toBe(400);
      expect(res.data).toEqual({
        message: 'Validation Failed',
        errors: [{}],
      });
    });

    // Enable with validation ticket
    it.skip('should strip unknown fields when creating a participant', async () => {
      const res = await axiosInstance.post(`/api/prm/participants`, {
        ...participantDefinitionWithEveryField,
        unknownField: faker.word.noun(),
      });

      expect(res.status).toBe(201);
      expect(res.data).toEqual(participantWithEveryField);
    });

    // Currently it doesn't strip ids, instead overwriting them in the db layer
    it('should strip ids when sent in the request body', async () => {
      const res = await axiosInstance.post(
        `/api/prm/participants`,
        participantDefinitionWithIds,
      );

      expect(res.status).toBe(201);
      expect(ParticipantSchema.parse(res.data)).toEqual(
        participantWithEveryField,
      );
      expect(res.data.id).not.toEqual(participantDefinitionWithIds.id);
      res.data.contactDetails.forEach((contactDetail: any, index: number) => {
        expect(contactDetail.id).not.toEqual(
          participantDefinitionWithIds.contactDetails[index].id,
        );
      });
      res.data.identification.forEach((identification: any, index: number) => {
        expect(identification.id).not.toEqual(
          participantDefinitionWithIds.identification[index].id,
        );
      });
    });
  });

  describe('GET /api/prm/participants/:id', () => {
    let participantId: string;

    beforeAll(async () => {
      const res = await axiosInstance.post(
        `/api/prm/participants`,
        participantDefinitionWithEveryField,
      );

      participantId = res.data.id;
    });

    it('should return a participant', async () => {
      const res = await axiosInstance.get(
        `/api/prm/participants/${participantId}`,
      );

      expect(res.status).toBe(200);
      expect(ParticipantSchema.parse(res.data)).toEqual(
        participantWithEveryField,
      );
    });

    it('should return an error if the participant does not exist', async () => {
      const response = await axiosInstance.get(
        `/api/prm/participants/${ulid()}`,
      );

      expect(response.status).toBe(404);
    });
  });
});

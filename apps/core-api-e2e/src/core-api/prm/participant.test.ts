import axios from 'axios';
import { faker } from '@faker-js/faker';
import { ulid } from 'ulidx';

import { ParticipantGenerator } from '@nrcno/core-test-utils';

import {
  ParticipantSchema,
  ParticipantDefinition,
  Participant,
} from '@nrcno/core-models';

const axiosInstance = axios.create({
  validateStatus: () => true,
});

const participantDefinitionWithEveryField =
  ParticipantGenerator.generateDefinition();

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
    
    it('should return 404 if the participant id is invalid', async () => {
      const response = await axiosInstance.get(
        `/api/prm/participants/invalid`,
      );

      expect(response.status).toBe(404);
    }
  });
});

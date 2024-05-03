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

const generateExpectedParticipant = (
  participantDefinition: ParticipantDefinition,
): Participant => ({
  ...participantDefinition,
  id: expect.any(String),
  contactDetails: {
    emails: participantDefinition.contactDetails.emails.map(
      (contactDetail) => ({
        ...contactDetail,
        id: expect.any(String),
      }),
    ),
    phones: participantDefinition.contactDetails.phones.map(
      (contactDetail) => ({
        ...contactDetail,
        id: expect.any(String),
      }),
    ),
  },
  identification: participantDefinition.identification.map(
    (identification) => ({
      ...identification,
      id: expect.any(String),
    }),
  ),
  languages: participantDefinition.languages.map((language) => ({
    ...language,
    translationKey: `language__${language.isoCode}`,
  })),
  nationalities: participantDefinition.nationalities.map((nationality) => ({
    ...nationality,
    translationKey: `nationality__${nationality.isoCode}`,
  })),
});
const participantWithEveryField = generateExpectedParticipant(
  participantDefinitionWithEveryField,
);

const participantDefinitionWithSomeFields: ParticipantDefinition = {
  consentGdpr: faker.datatype.boolean(),
  consentReferral: faker.datatype.boolean(),
  languages: [],
  nationalities: [],
  contactDetails: { emails: [], phones: [] },
  identification: [],
};

const participantWithSomeFields: Participant = {
  ...participantDefinitionWithSomeFields,
  id: expect.any(String),
  contactDetails: { emails: [], phones: [] },
  identification: [],
  languages: [],
  nationalities: [],
};

const participantDefinitionWithMissingRequiredFields = {
  consentReferral: faker.datatype.boolean(),
  languages: [],
  nationalities: [],
  contactDetails: { emails: [], phones: [] },
  identification: [],
};

const participantDefinitionWithInvalidFields = {
  sex: 'invalid',
  consentGdpr: faker.datatype.boolean(),
  consentReferral: faker.datatype.boolean(),
  languages: [],
  nationalities: [],
  contactDetails: { emails: [], phones: [] },
  identification: [],
};

const participantDefinitionWithIds = {
  ...participantDefinitionWithEveryField,
  id: ulid(),
  contactDetails: {
    emails: participantDefinitionWithEveryField.contactDetails.emails.map(
      (contactDetail) => ({
        ...contactDetail,
        id: faker.string.uuid(),
      }),
    ),
    phones: participantDefinitionWithEveryField.contactDetails.phones.map(
      (contactDetail) => ({
        ...contactDetail,
        id: faker.string.uuid(),
      }),
    ),
  },
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

    it('should return an error when creating a participant with missing required fields', async () => {
      const res = await axiosInstance.post(
        `/api/prm/participants`,
        participantDefinitionWithMissingRequiredFields,
      );

      expect(res.status).toBe(400);
    });

    it('should return an error when creating a participant with invalid fields', async () => {
      const res = await axiosInstance.post(
        `/api/prm/participants`,
        participantDefinitionWithInvalidFields,
      );
      expect(res.status).toBe(400);
    });

    it('should strip unknown fields when creating a participant', async () => {
      const res = await axiosInstance.post(`/api/prm/participants`, {
        ...participantDefinitionWithEveryField,
        unknownField: faker.word.noun(),
      });

      expect(res.status).toBe(201);
      expect(ParticipantSchema.parse(res.data)).toEqual(
        participantWithEveryField,
      );
    });

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
      res.data.contactDetails.emails.forEach(
        (contactDetail: any, index: number) => {
          expect(contactDetail.id).not.toEqual(
            participantDefinitionWithIds.contactDetails.emails[index].id,
          );
        },
      );
      res.data.contactDetails.phones.forEach(
        (contactDetail: any, index: number) => {
          expect(contactDetail.id).not.toEqual(
            participantDefinitionWithIds.contactDetails.phones[index].id,
          );
        },
      );
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
      const response = await axiosInstance.get(`/api/prm/participants/invalid`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/prm/participants/:id', () => {
    let participantId: string;

    beforeAll(async () => {
      const res = await axiosInstance.post(
        `/api/prm/participants`,
        participantDefinitionWithEveryField,
      );
      participantId = res.data.id;
    });

    it('should update a participant', async () => {
      const participantUpdate = ParticipantGenerator.generateDefinition();
      const res = await axiosInstance.put(
        `/api/prm/participants/${participantId}`,
        participantUpdate,
      );

      expect(res.status).toBe(200);
      const expectedParticipant =
        generateExpectedParticipant(participantUpdate);
      expect(ParticipantSchema.parse(res.data)).toEqual(expectedParticipant);
    });

    it('should return an error if the participant does not exist', async () => {
      const response = await axiosInstance.put(
        `/api/prm/participants/${ulid()}`,
        participantDefinitionWithEveryField,
      );

      expect(response.status).toBe(404);
    });

    it('should return 404 if the participant id is invalid', async () => {
      const response = await axiosInstance.put(
        `/api/prm/participants/invalid`,
        participantDefinitionWithEveryField,
      );

      expect(response.status).toBe(404);
    });

    it('should return an error when updating a participant with missing required fields', async () => {
      const response = await axiosInstance.put(
        `/api/prm/participants/${participantId}`,
        {
          ...participantDefinitionWithEveryField,
          consentGdpr: undefined,
        },
      );

      expect(response.status).toBe(400);
    });
  });
});

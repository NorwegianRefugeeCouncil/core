import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import { ZodError } from 'zod';
import { ulid } from 'ulidx';

import { ParticipantDefinition } from '@nrcno/core-models';

import { ParticipantClient } from './participant.client';

describe('PRM Participant client', () => {
  let client: ParticipantClient;
  let mock: any;

  beforeEach(() => {
    const axiosInstance = axios.create();
    mock = new MockAdapter(axiosInstance);
    client = new ParticipantClient(axiosInstance);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('create', () => {
    it('should create a participant', async () => {
      const participantDefinition = {
        consentGdpr: faker.datatype.boolean(),
        consentReferral: faker.datatype.boolean(),
        languages: [],
        nationalities: [],
        contactDetails: [],
        identification: [],
      };

      const participant = {
        id: ulid(),
        ...participantDefinition,
      };

      mock.onPost('/participants').reply(201, participant);

      const res = await client.create(participantDefinition);

      expect(res).toEqual(participant);
      expect(mock.history.post.length).toBe(1);
      expect(mock.history.post[0].url).toBe('/participants');
      expect(mock.history.post[0].data).toBe(
        JSON.stringify(participantDefinition),
      );
    });

    it('should fail with an invalid participant definition', async () => {
      const participantDefinition = {
        firstName: faker.person.firstName(),
      };

      await expect(
        client.create(participantDefinition as ParticipantDefinition),
      ).rejects.toThrow(expect.any(ZodError));
    });

    it('should fail when receiving an invalid response from the api', () => {
      const participantDefinition = {
        consentGdpr: faker.datatype.boolean(),
        consentReferral: faker.datatype.boolean(),
        languages: [],
        nationalities: [],
        contactDetails: [],
        identification: [],
      };

      mock.onPost('/participants').reply(201, {
        foo: 'bar',
      });

      expect(client.create(participantDefinition)).rejects.toThrow(
        expect.any(ZodError),
      );
    });

    it('should fail if the api returns an error', () => {
      const participantDefinition = {
        consentGdpr: faker.datatype.boolean(),
        consentReferral: faker.datatype.boolean(),
        languages: [],
        nationalities: [],
        contactDetails: [],
        identification: [],
      };

      mock.onPost('/participants').reply(400);

      expect(client.create(participantDefinition)).rejects.toThrow(
        'Request failed with status code 400',
      );
    });
  });
});

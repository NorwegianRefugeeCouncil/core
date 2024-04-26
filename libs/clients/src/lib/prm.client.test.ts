import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import { ZodError } from 'zod';
import { ulid } from 'ulidx';

import { EntityType, ParticipantDefinition } from '@nrcno/core-models';

import { PrmClient } from './prm.client';

describe('PRM client', () => {
  describe('Participant', () => {
    let client: PrmClient[EntityType.Participant];
    let mock: any;

    beforeEach(() => {
      const axiosInstance = axios.create();
      mock = new MockAdapter(axiosInstance);
      const prmClient = new PrmClient(axiosInstance);
      client = prmClient[EntityType.Participant];
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

        mock.onPost('/prm/participants').reply(201, participant);

        const res = await client.create(participantDefinition);

        expect(res).toEqual(participant);
        expect(mock.history.post.length).toBe(1);
        expect(mock.history.post[0].url).toBe('/prm/participants');
        expect(mock.history.post[0].data).toBe(
          JSON.stringify(participantDefinition),
        );
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

        mock.onPost('/prm/participants').reply(201, {
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

        mock.onPost('/prm/participants').reply(400);

        expect(client.create(participantDefinition)).rejects.toThrow(
          'Request failed with status code 400',
        );
      });
    });

    describe('read', () => {
      it('should read a participant', async () => {
        const participantId = ulid();
        const participant = {
          id: participantId,
          consentGdpr: faker.datatype.boolean(),
          consentReferral: faker.datatype.boolean(),
          languages: [],
          nationalities: [],
          contactDetails: [],
          identification: [],
        };
        mock
          .onGet(`/prm/participants/${participantId}`)
          .reply(200, participant);
        const res = await client.read(participantId);
        expect(res).toEqual(participant);
        expect(mock.history.get.length).toBe(1);
        expect(mock.history.get[0].url).toBe(
          `/prm/participants/${participantId}`,
        );
      });

      it('should fail when receiving an invalid response from the api', () => {
        const participantId = ulid();
        mock.onGet(`/prm/participants/${participantId}`).reply(200, {
          foo: 'bar',
        });
        expect(client.read(participantId)).rejects.toThrow(
          expect.any(ZodError),
        );
      });

      it('should fail if the api returns an error', () => {
        const participantId = ulid();
        mock.onGet(`/prm/participants/${participantId}`).reply(400);
        expect(client.read(participantId)).rejects.toThrow(
          'Request failed with status code 400',
        );
      });
    });
  });
});

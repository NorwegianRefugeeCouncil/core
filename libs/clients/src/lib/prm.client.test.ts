import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import { ZodError } from 'zod';
import { ulid } from 'ulidx';

import { ParticipantGenerator } from '@nrcno/core-test-utils';
import { EntityType, Pagination } from '@nrcno/core-models';

import { PrmClient } from './prm.client';

describe('PRM client', () => {
  describe('Participant', () => {
    let client: PrmClient[EntityType.Participant];
    let mock: any;

    beforeEach(() => {
      const axiosInstance = axios.create();
      mock = new MockAdapter(axiosInstance);
      mock.history['QUERY'] = [];
      mock.history['query'] = [];
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
          contactDetails: { emails: [], phones: [] },
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
          contactDetails: { emails: [], phones: [] },
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
          contactDetails: { emails: [], phones: [] },
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
          contactDetails: { emails: [], phones: [] },
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

    describe('update', () => {
      it('should update a participant', async () => {
        const participant = ParticipantGenerator.generateEntity();
        const participantId = participant.id;
        const updatedParticipant = {
          ...participant,
          consentGdpr: !participant.consentGdpr,
        };
        mock
          .onPut(`/prm/participants/${participantId}`)
          .reply(200, updatedParticipant);
        const res = await client.update(participantId, {
          consentGdpr: !participant.consentGdpr,
        });
        expect(res).toEqual(updatedParticipant);
        expect(mock.history.put.length).toBe(1);
        expect(mock.history.put[0].url).toBe(
          `/prm/participants/${participantId}`,
        );
        expect(mock.history.put[0].data).toBe(
          JSON.stringify({ consentGdpr: !participant.consentGdpr }),
        );
      });

      it('should fail when receiving an invalid response from the api', () => {
        const participant = ParticipantGenerator.generateEntity();
        const participantId = participant.id;
        mock.onPut(`/prm/participants/${participantId}`).reply(200, {
          foo: 'bar',
        });
        expect(client.update(participantId, participant)).rejects.toThrow(
          expect.any(ZodError),
        );
      });

      it('should fail if the api returns an error', () => {
        const participant = ParticipantGenerator.generateEntity();
        const participantId = participant.id;
        mock.onPut(`/prm/participants/${participantId}`).reply(500);
        expect(client.update(participantId, participant)).rejects.toThrow(
          'Request failed with status code 500',
        );
      });
    });

    describe('list', () => {
      const pagination: Pagination = {
        startIndex: 0,
        pageSize: 100,
      };

      it('should list participants', async () => {
        const participants = new Array(5)
          .fill(null)
          .map(() => ParticipantGenerator.generateListItem());
        const responsePayload = {
          startIndex: 0,
          pageSize: 100,
          totalCount: 5,
          items: participants,
        };
        mock.onGet('/prm/participants').reply(200, responsePayload);
        const res = await client.list(pagination);
        expect(res).toEqual(responsePayload);
        expect(mock.history.get.length).toBe(1);
        expect(mock.history.get[0].url).toBe('/prm/participants');
      });

      it('should fail when receiving an invalid response from the api', () => {
        mock.onGet('/prm/participants').reply(200, { foo: 'bar' });
        expect(client.list(pagination)).rejects.toThrow(expect.any(ZodError));
      });

      it('should fail if the api returns an error', () => {
        mock.onGet('/prm/participants').reply(500);
        expect(client.list(pagination)).rejects.toThrow(
          'Request failed with status code 500',
        );
      });
    });
  });
});

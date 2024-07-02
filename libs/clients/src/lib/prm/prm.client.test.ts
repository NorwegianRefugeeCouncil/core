import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import { ZodError } from 'zod';
import { ulid } from 'ulidx';

import {
  IndividualGenerator,
  getListItemGenerator,
} from '@nrcno/core-test-utils';
import { EntityFiltering, EntityType, Pagination } from '@nrcno/core-models';

import { PrmClient, hasListMixin } from '.';

const buildListTests = (entityType: EntityType) => {
  describe('list', () => {
    let client: PrmClient[EntityType];
    let mock: any;

    beforeEach(() => {
      const axiosInstance = axios.create();
      mock = new MockAdapter(axiosInstance);
      const prmClient = new PrmClient(axiosInstance);
      client = prmClient[entityType];
    });

    afterEach(() => {
      mock.restore();
    });

    const pagination: Pagination = {
      startIndex: 0,
      pageSize: 100,
    };

    it(`should list ${entityType}`, async () => {
      if (!hasListMixin(client)) {
        throw new Error(`Client does not have a read method`);
      }

      const listItemGenerator = getListItemGenerator(entityType);
      const listItems = new Array(5).fill(null).map(() => listItemGenerator());
      const responsePayload = {
        startIndex: 0,
        pageSize: 100,
        totalCount: 5,
        items: listItems,
      };
      mock.onGet(`/prm/${entityType}`).reply(200, responsePayload);
      const res = await client.list(pagination);
      expect(res).toEqual(responsePayload);
      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].url).toBe(`/prm/${entityType}`);
    });

    it('should fail when receiving an invalid response from the api', () => {
      if (!hasListMixin(client)) {
        throw new Error(`Client does not have a read method`);
      }

      mock.onGet(`/prm/${entityType}`).reply(200, { foo: 'bar' });
      expect(client.list(pagination)).rejects.toThrow(expect.any(ZodError));
    });

    it('should fail if the api returns an error', () => {
      if (!hasListMixin(client)) {
        throw new Error(`Client does not have a read method`);
      }

      mock.onGet(`/prm/${entityType}`).reply(500);
      expect(client.list(pagination)).rejects.toThrow(
        'Request failed with status code 500',
      );
    });
  });
};

describe('PRM client', () => {
  describe('Individual', () => {
    let client: PrmClient[EntityType.Individual];
    let mock: any;

    beforeEach(() => {
      const axiosInstance = axios.create();
      mock = new MockAdapter(axiosInstance);
      const prmClient = new PrmClient(axiosInstance);
      client = prmClient[EntityType.Individual];
    });

    afterEach(() => {
      mock.restore();
    });

    describe('create', () => {
      it('should create a individual', async () => {
        const individualDefinition = {
          consentGdpr: faker.datatype.boolean(),
          consentReferral: faker.datatype.boolean(),
          languages: [],
          nationalities: [],
          emails: [],
          phones: [],
          identification: [],
          householdId: ulid(),
        };

        const individual = {
          id: ulid(),
          ...individualDefinition,
        };

        mock.onPost('/prm/individuals').reply(201, individual);

        const res = await client.create(individualDefinition);

        expect(res).toEqual(individual);
        expect(mock.history.post.length).toBe(1);
        expect(mock.history.post[0].url).toBe('/prm/individuals');
        expect(mock.history.post[0].data).toBe(
          JSON.stringify(individualDefinition),
        );
      });

      it('should fail when receiving an invalid response from the api', () => {
        const individualDefinition = {
          consentGdpr: faker.datatype.boolean(),
          consentReferral: faker.datatype.boolean(),
          languages: [],
          nationalities: [],
          emails: [],
          phones: [],
          identification: [],
        };

        mock.onPost('/prm/individuals').reply(201, {
          foo: 'bar',
        });

        expect(client.create(individualDefinition)).rejects.toThrow(
          expect.any(ZodError),
        );
      });

      it('should fail if the api returns an error', () => {
        const individualDefinition = {
          consentGdpr: faker.datatype.boolean(),
          consentReferral: faker.datatype.boolean(),
          languages: [],
          nationalities: [],
          emails: [],
          phones: [],
          identification: [],
        };

        mock.onPost('/prm/individuals').reply(400);

        expect(client.create(individualDefinition)).rejects.toThrow(
          'Request failed with status code 400',
        );
      });
    });

    describe('read', () => {
      it('should read a individual', async () => {
        const individualId = ulid();
        const individual = {
          id: individualId,
          consentGdpr: faker.datatype.boolean(),
          consentReferral: faker.datatype.boolean(),
          languages: [],
          nationalities: [],
          emails: [],
          phones: [],
          identification: [],
          householdId: ulid(),
        };
        mock.onGet(`/prm/individuals/${individualId}`).reply(200, individual);
        const res = await client.read(individualId);
        expect(res).toEqual(individual);
        expect(mock.history.get.length).toBe(1);
        expect(mock.history.get[0].url).toBe(
          `/prm/individuals/${individualId}`,
        );
      });

      it('should fail when receiving an invalid response from the api', () => {
        const individualId = ulid();
        mock.onGet(`/prm/individuals/${individualId}`).reply(200, {
          foo: 'bar',
        });
        expect(client.read(individualId)).rejects.toThrow(expect.any(ZodError));
      });

      it('should fail if the api returns an error', () => {
        const individualId = ulid();
        mock.onGet(`/prm/individuals/${individualId}`).reply(400);
        expect(client.read(individualId)).rejects.toThrow(
          'Request failed with status code 400',
        );
      });
    });

    describe('update', () => {
      it('should update a individual', async () => {
        const individual = IndividualGenerator.generateEntity();
        const individualId = individual.id;
        const updatedIndividual = {
          ...individual,
          consentGdpr: !individual.consentGdpr,
        };
        mock
          .onPut(`/prm/individuals/${individualId}`)
          .reply(200, updatedIndividual);
        const res = await client.update(individualId, {
          consentGdpr: !individual.consentGdpr,
        });
        expect(res).toEqual(updatedIndividual);
        expect(mock.history.put.length).toBe(1);
        expect(mock.history.put[0].url).toBe(
          `/prm/individuals/${individualId}`,
        );
        expect(mock.history.put[0].data).toBe(
          JSON.stringify({ consentGdpr: !individual.consentGdpr }),
        );
      });

      it('should fail when receiving an invalid response from the api', () => {
        const individual = IndividualGenerator.generateEntity();
        const individualId = individual.id;
        mock.onPut(`/prm/individuals/${individualId}`).reply(200, {
          foo: 'bar',
        });
        expect(client.update(individualId, individual)).rejects.toThrow(
          expect.any(ZodError),
        );
      });

      it('should fail if the api returns an error', () => {
        const individual = IndividualGenerator.generateEntity();
        const individualId = individual.id;
        mock.onPut(`/prm/individuals/${individualId}`).reply(500);
        expect(client.update(individualId, individual)).rejects.toThrow(
          'Request failed with status code 500',
        );
      });
    });

    buildListTests(EntityType.Individual);
  });

  describe('Language', () => {
    buildListTests(EntityType.Language);
  });

  describe('Nationality', () => {
    buildListTests(EntityType.Nationality);
  });
});

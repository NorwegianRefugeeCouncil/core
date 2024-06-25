import * as httpMocks from 'node-mocks-http';
import { ulid } from 'ulidx';

import { EntityType } from '@nrcno/core-models';
import { getPrmService } from '@nrcno/core-prm-engine';

import {
  createEntity,
  getEntity,
  listEntities,
  updateEntity,
} from './prm.controller';

const fakeIndividual = {
  consentGdpr: true,
  consentReferral: true,
  firstName: 'John',
  lastName: 'Doe',
};

const fakeIndividualWithDefaults = {
  ...fakeIndividual,
  emails: [],
  phones: [],
  identification: [],
  languages: [],
  nationalities: [],
};

const ps = {
  count: jest.fn().mockResolvedValue(0),
  validateAndCreate: jest.fn().mockImplementation((entityDefinition) => ({
    ...entityDefinition,
    id: ulid(),
  })),
  get: jest.fn().mockImplementation((id) => ({
    ...fakeIndividualWithDefaults,
    id,
  })),
  list: jest.fn().mockResolvedValue([]),
  validateAndUpdate: jest.fn().mockImplementation((id, entityDefinition) => ({
    ...entityDefinition,
    id,
  })),
};

jest.mock('@nrcno/core-prm-engine', () => ({
  ...jest.requireActual('@nrcno/core-prm-engine'),
  getPrmService: jest.fn().mockImplementation((entityType) => {
    switch (entityType) {
      case EntityType.Individual:
        return ps;
      default:
        throw new Error('Entity type not found');
    }
  }),
}));

describe('PRM Controller', () => {
  describe('Individual', () => {
    let individualService: any;

    beforeEach(() => {
      individualService = getPrmService(EntityType.Individual);
    });

    describe('create', () => {
      it('should return 201 and the created entity', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
          },
          body: fakeIndividualWithDefaults,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await createEntity(req, res, next);

        expect(individualService.validateAndCreate).toHaveBeenCalledWith(
          fakeIndividualWithDefaults,
        );
        expect(res.statusCode).toEqual(201);
        expect(res._getJSONData()).toEqual({
          ...fakeIndividualWithDefaults,
          id: expect.any(String),
        });
      });

      it('should return a 404 if the entity type is not found', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: 'Unknown',
          },
          body: fakeIndividual,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await createEntity(req, res, next);

        expect(res.statusCode).toEqual(404);
      });

      it('should call next with an error if the prm service throws an error', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
          },
          body: fakeIndividual,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        (individualService.validateAndCreate as jest.Mock).mockRejectedValue(
          new Error('Failed to create entity'),
        );

        await createEntity(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('Failed to create entity'));
      });
    });

    describe('get', () => {
      it('should return 200 and the entity', async () => {
        const id = ulid();
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
            entityId: id,
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await getEntity(req, res, next);

        expect(individualService.get).toHaveBeenCalledWith(id);
        expect(res.statusCode).toEqual(200);
        expect(res._getJSONData()).toEqual({
          ...fakeIndividualWithDefaults,
          id,
        });
      });

      it('should return a 404 if the entity type is not found', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: 'Unknown',
            entityId: ulid(),
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await getEntity(req, res, next);

        expect(res.statusCode).toEqual(404);
      });

      it('should return a 404 if the entity id is invalid', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
            entityId: 'invalid',
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await getEntity(req, res, next);

        expect(res.statusCode).toEqual(404);
      });

      it('should call next with an error if the prm service throws an error', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
            entityId: ulid(),
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        (individualService.get as jest.Mock).mockRejectedValue(
          new Error('Failed to get entity'),
        );

        await getEntity(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('Failed to get entity'));
      });

      it('should return 404 if the entity is not found', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
            entityId: ulid(),
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        (individualService.get as jest.Mock).mockResolvedValue(null);

        await getEntity(req, res, next);

        expect(res.statusCode).toEqual(404);
      });
    });

    describe('list', () => {
      it('should return 404 if entityType is invalid', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: 'Invalid',
          },
          query: {
            startIndex: 0,
            pageSize: 2,
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await listEntities(req, res, next);

        expect(res.statusCode).toEqual(404);
      });

      it('should return paginated entities', async () => {
        const mockEntities = [{ id: 1 }, { id: 2 }];
        const mockCount = 2;

        (individualService.list as jest.Mock).mockResolvedValue(mockEntities);
        (individualService.count as jest.Mock).mockResolvedValue(mockCount);

        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
          },
          query: {
            startIndex: 0,
            pageSize: 2,
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await listEntities(req, res, next);

        expect(res.statusCode).toEqual(200);
        expect(res._getJSONData()).toEqual({
          startIndex: 0,
          pageSize: 2,
          totalCount: mockCount,
          items: mockEntities,
        });
      });

      it('should pass error to next middleware if PrmService throws error', async () => {
        (individualService.list as jest.Mock).mockRejectedValue(
          new Error('Test error'),
        );

        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
          },
          query: {
            startIndex: 0,
            pageSize: 2,
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await listEntities(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('Test error'));
      });

      it('should call next with error if sorting field is invalid', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
          },
          query: {
            startIndex: 0,
            pageSize: 2,
            sort: 'invalid',
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await listEntities(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      it('should call next with error if filtering field is invalid', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
          },
          query: {
            startIndex: 0,
            pageSize: 2,
            hasDisabilityPwd: 'invalid',
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await listEntities(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });

    describe('update', () => {
      it('should return 200 and the updated entity', async () => {
        const id = ulid();
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
            entityId: id,
          },
          body: fakeIndividual,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await updateEntity(req, res, next);

        expect(individualService.validateAndUpdate).toHaveBeenCalledWith(
          id,
          fakeIndividualWithDefaults,
        );
        expect(res.statusCode).toEqual(200);
        expect(res._getJSONData()).toEqual({
          ...fakeIndividualWithDefaults,
          id,
        });
      });

      it('should return a 404 if the entity type is not found', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: 'Unknown',
            entityId: ulid(),
          },
          body: fakeIndividual,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await updateEntity(req, res, next);

        expect(res.statusCode).toEqual(404);
      });

      it('should return a 404 if the entity id is invalid', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
            entityId: 'invalid',
          },
          body: fakeIndividual,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await updateEntity(req, res, next);

        expect(res.statusCode).toEqual(404);
      });

      it('should call next with an error if the prm service throws an error', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Individual,
            entityId: ulid(),
          },
          body: fakeIndividual,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        (individualService.validateAndUpdate as jest.Mock).mockRejectedValue(
          new Error('Failed to update entity'),
        );

        await updateEntity(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('Failed to update entity'));
      });
    });
  });
});

import * as httpMocks from 'node-mocks-http';
import { ulid } from 'ulidx';

import { EntityType } from '@nrcno/core-models';
import { PrmService } from '@nrcno/core-prm-engine';

import {
  createEntity,
  getEntity,
  listEntities,
  updateEntity,
} from './prm.controller';

const fakeParticipant = {
  consentGdpr: true,
  consentReferral: true,
  firstName: 'John',
  lastName: 'Doe',
};

const fakeParticipantWithDefaults = {
  ...fakeParticipant,
  contactDetails: {
    emails: [],
    phones: [],
  },
  identification: [],
  languages: [],
  nationalities: [],
};

jest.mock('@nrcno/core-prm-engine', () => ({
  PrmService: {
    [EntityType.Participant]: {
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation((entityDefinition) => ({
        ...entityDefinition,
        id: ulid(),
      })),
      get: jest
        .fn()
        .mockImplementation((id) => ({ ...fakeParticipantWithDefaults, id })),
      list: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockImplementation((id, entityDefinition) => ({
        ...entityDefinition,
        id,
      })),
    },
  },
}));

describe('PRM Controller', () => {
  describe('Participant', () => {
    describe('create', () => {
      it('should return 201 and the created entity', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Participant,
          },
          body: fakeParticipant,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await createEntity(req, res, next);

        expect(PrmService[EntityType.Participant].create).toHaveBeenCalledWith(
          fakeParticipantWithDefaults,
        );
        expect(res.statusCode).toEqual(201);
        expect(res._getJSONData()).toEqual({
          ...fakeParticipantWithDefaults,
          id: expect.any(String),
        });
      });

      it('should return a 404 if the entity type is not found', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: 'Unknown',
          },
          body: fakeParticipant,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await createEntity(req, res, next);

        expect(res.statusCode).toEqual(404);
      });

      it('should call next with an error if the prm service throws an error', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Participant,
          },
          body: fakeParticipant,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        (
          PrmService[EntityType.Participant].create as jest.Mock
        ).mockRejectedValue(new Error('Failed to create entity'));

        await createEntity(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('Failed to create entity'));
      });
    });

    describe('get', () => {
      it('should return 200 and the entity', async () => {
        const id = ulid();
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Participant,
            entityId: id,
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await getEntity(req, res, next);

        expect(PrmService[EntityType.Participant].get).toHaveBeenCalledWith(id);
        expect(res.statusCode).toEqual(200);
        expect(res._getJSONData()).toEqual({
          ...fakeParticipantWithDefaults,
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
            entityType: EntityType.Participant,
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
            entityType: EntityType.Participant,
            entityId: ulid(),
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        (PrmService[EntityType.Participant].get as jest.Mock).mockRejectedValue(
          new Error('Failed to get entity'),
        );

        await getEntity(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('Failed to get entity'));
      });

      it('should return 404 if the entity is not found', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Participant,
            entityId: ulid(),
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        (PrmService[EntityType.Participant].get as jest.Mock).mockResolvedValue(
          null,
        );

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

        (
          PrmService[EntityType.Participant].list as jest.Mock
        ).mockResolvedValue(mockEntities);
        (
          PrmService[EntityType.Participant].count as jest.Mock
        ).mockResolvedValue(mockCount);

        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Participant,
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
        (
          PrmService[EntityType.Participant].list as jest.Mock
        ).mockRejectedValue(new Error('Test error'));

        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Participant,
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
    });

    describe('update', () => {
      it('should return 200 and the updated entity', async () => {
        const id = ulid();
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Participant,
            entityId: id,
          },
          body: fakeParticipant,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await updateEntity(req, res, next);

        expect(PrmService[EntityType.Participant].update).toHaveBeenCalledWith(
          id,
          fakeParticipantWithDefaults,
        );
        expect(res.statusCode).toEqual(200);
        expect(res._getJSONData()).toEqual({
          ...fakeParticipantWithDefaults,
          id,
        });
      });

      it('should return a 404 if the entity type is not found', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: 'Unknown',
            entityId: ulid(),
          },
          body: fakeParticipant,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await updateEntity(req, res, next);

        expect(res.statusCode).toEqual(404);
      });

      it('should return a 404 if the entity id is invalid', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Participant,
            entityId: 'invalid',
          },
          body: fakeParticipant,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await updateEntity(req, res, next);

        expect(res.statusCode).toEqual(404);
      });

      it('should call next with an error if the prm service throws an error', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Participant,
            entityId: ulid(),
          },
          body: fakeParticipant,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        (
          PrmService[EntityType.Participant].update as jest.Mock
        ).mockRejectedValue(new Error('Failed to update entity'));

        await updateEntity(req, res, next);

        expect(next).toHaveBeenCalledWith(new Error('Failed to update entity'));
      });
    });
  });
});

import * as httpMocks from 'node-mocks-http';
import { ZodError } from 'zod';
import { ulid } from 'ulidx';

import { EntityType } from '@nrcno/core-models';
import { PrmService } from '@nrcno/core-prm-engine';

import { createEntity, getEntity } from './prm.controller';

const fakeParticipant = {
  consentGdpr: true,
  consentReferral: true,
  firstName: 'John',
  lastName: 'Doe',
};

jest.mock('@nrcno/core-prm-engine', () => ({
  PrmService: {
    [EntityType.Participant]: {
      create: jest
        .fn()
        .mockImplementation((entityDefinition) => entityDefinition),
      get: jest.fn().mockImplementation((id) => ({ ...fakeParticipant, id })),
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
          fakeParticipant,
        );
        expect(res.statusCode).toEqual(201);
        expect(res._getJSONData()).toEqual(fakeParticipant);
      });

      it('should call next with an error if the entity type is not found', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: 'Unknown',
          },
          body: fakeParticipant,
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await createEntity(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ZodError));
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
        expect(res._getJSONData()).toEqual({ ...fakeParticipant, id });
      });

      it('should call next with an error if the entity type is not found', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: 'Unknown',
            entityId: ulid(),
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await getEntity(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ZodError));
      });

      it('should call next with an error if the entity id is invalid', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: EntityType.Participant,
            entityId: 'invalid',
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await getEntity(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(ZodError));
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
  });
});

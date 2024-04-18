import * as httpMocks from 'node-mocks-http';
import { ZodError } from 'zod';

import { EntityType } from '@nrcno/core-models';
import { PrmService } from '@nrcno/core-prm-engine';

import { createEntity } from './prm.controller';

jest.mock('@nrcno/core-prm-engine', () => ({
  PrmService: {
    [EntityType.Participant]: {
      create: jest
        .fn()
        .mockImplementation((entityDefinition) => entityDefinition),
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
          body: {
            name: 'John Doe',
          },
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        await createEntity(req, res, next);

        expect(PrmService[EntityType.Participant].create).toHaveBeenCalledWith({
          name: 'John Doe',
        });
        expect(res.statusCode).toEqual(201);
        expect(res._getJSONData()).toEqual({ name: 'John Doe' });
      });

      it('should call next with an error if the entity type is not found', async () => {
        const req = httpMocks.createRequest({
          params: {
            entityType: 'Unknown',
          },
          body: {
            name: 'John Doe',
          },
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
          body: {
            name: 'John Doe',
          },
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
  });
});

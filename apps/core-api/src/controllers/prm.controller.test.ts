import httpMocks from 'node-mocks-http';
import { Request } from 'express';

import { EntityType } from '@nrcno/core-models';
import { PrmService } from '@nrcno/core-prm-engine';

import { prmRouter } from './prm.controller';

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

        await prmRouter.post('/prm/:entityType', req, res, next);

        expect(PrmService[EntityType.Participant].create).toHaveBeenCalledWith({
          name: 'John Doe',
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ name: 'John Doe' });
      });
    });
  });
});

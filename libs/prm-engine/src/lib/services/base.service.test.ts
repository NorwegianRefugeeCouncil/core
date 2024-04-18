import { EntityType, ParticipantDefinition } from '@nrcno/core-models';

import { PrmStore } from '../stores';

import { getPrmService } from './base.service';

jest.mock('../stores', () => ({
  PrmStore: {
    [EntityType.Participant]: {
      create: jest
        .fn()
        .mockImplementation((entity: ParticipantDefinition) => entity),
    },
  },
}));

describe('Base PRM service', () => {
  it('should error if the entity type is not supported', () => {
    expect(() => getPrmService('unknown' as EntityType)).toThrow(
      `Entity type "unknown" is not supported`,
    );
  });

  describe('Participant', () => {
    describe('create', () => {
      it('should create a participant service', () => {
        const entityType = EntityType.Participant;

        const service = getPrmService(entityType);

        expect(service).toBeDefined();
        expect(service.create).toBeDefined();
      });

      it('should call the store create method', async () => {
        const entityType = EntityType.Participant;

        const service = getPrmService(entityType);

        const participantDefinition: ParticipantDefinition = {
          consentGdpr: true,
          consentReferral: true,
          languages: [],
          nationalities: [],
          contactDetails: [],
          identification: [],
        };

        const result = await service.create(participantDefinition);

        expect(PrmStore[entityType].create).toHaveBeenCalledWith(
          participantDefinition,
        );
        expect(result).toEqual(participantDefinition);
      });

      it('should throw an error if the store create method fails', async () => {
        const entityType = EntityType.Participant;

        const service = getPrmService(entityType);

        const participantDefinition: ParticipantDefinition = {
          consentGdpr: true,
          consentReferral: true,
          languages: [],
          nationalities: [],
          contactDetails: [],
          identification: [],
        };

        jest
          .spyOn(PrmStore[entityType], 'create')
          .mockRejectedValue(new Error('Failed to create participant'));

        await expect(service.create(participantDefinition)).rejects.toThrow(
          'Failed to create participant',
        );
        expect(PrmStore[entityType].create).toHaveBeenCalledWith(
          participantDefinition,
        );
      });
    });
  });
});

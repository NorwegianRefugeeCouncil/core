import { EntityType, ParticipantDefinition } from '@nrcno/core-models';

import { ParticipantService } from './participant.service';
import { getPrmService } from './base.service';

jest.mock('./base.service', () => ({
  getPrmService: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockImplementation((entity: ParticipantDefinition) => entity),
  }),
}));

describe('Participant service', () => {
  describe('create', () => {
    it('should call the base service create method', async () => {
      const participantDefinition: ParticipantDefinition = {
        consentGdpr: true,
        consentReferral: true,
        languages: [],
        nationalities: [],
        contactDetails: { emails: [], phones: [] },
        identification: [],
      };

      const result = await ParticipantService.create(participantDefinition);

      expect(getPrmService).toHaveBeenCalledWith(EntityType.Participant);
      expect(getPrmService(EntityType.Participant).create).toHaveBeenCalledWith(
        participantDefinition,
      );
      expect(result).toEqual(participantDefinition);
    });

    it('should throw an error if the base service create method fails', async () => {
      const participantDefinition: ParticipantDefinition = {
        consentGdpr: true,
        consentReferral: true,
        languages: [],
        nationalities: [],
        contactDetails: { emails: [], phones: [] },
        identification: [],
      };

      getPrmService(EntityType.Participant).create = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to create participant'));

      await expect(
        ParticipantService.create(participantDefinition),
      ).rejects.toThrow('Failed to create participant');

      expect(getPrmService).toHaveBeenCalledWith(EntityType.Participant);
      expect(getPrmService(EntityType.Participant).create).toHaveBeenCalledWith(
        participantDefinition,
      );
    });
  });
});

import { ParticipantGenerator } from '@nrcno/core-test-utils';

import { ParticipantStore } from '../stores/participant.store';

import { ParticipantService } from './participant.service';

jest.mock('../stores/participant.store', () => ({
  ParticipantStore: {
    create: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
  },
}));

describe('Participant service', () => {
  describe('create', () => {
    it('should call the store create method', async () => {
      const participantDefinition = ParticipantGenerator.generateDefinition();
      const participant = ParticipantGenerator.generateEntity();
      ParticipantStore.create = jest.fn().mockResolvedValueOnce(participant);

      const result = await ParticipantService.create(participantDefinition);

      expect(ParticipantStore.create).toHaveBeenCalledWith(
        participantDefinition,
      );
      expect(result).toEqual(participant);
    });

    it('should throw an error if the store create method fails', async () => {
      const participantDefinition = ParticipantGenerator.generateDefinition();

      ParticipantStore.create = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to create participant'));

      await expect(
        ParticipantService.create(participantDefinition),
      ).rejects.toThrow('Failed to create participant');

      expect(ParticipantStore.create).toHaveBeenCalledWith(
        participantDefinition,
      );
    });
  });

  describe('get', () => {
    it('should call the store get method', async () => {
      const participant = ParticipantGenerator.generateEntity();
      ParticipantStore.get = jest.fn().mockResolvedValueOnce(participant);

      const result = await ParticipantService.get(participant.id);

      expect(ParticipantStore.get).toHaveBeenCalledWith(participant.id);
      expect(result).toEqual(participant);
    });

    it('should return null if the store get method returns null', async () => {
      ParticipantStore.get = jest.fn().mockResolvedValueOnce(null);

      const result = await ParticipantService.get('id');

      expect(ParticipantStore.get).toHaveBeenCalledWith('id');
      expect(result).toBeNull();
    });

    it('should throw an error if the store get method fails', async () => {
      ParticipantStore.get = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to get participant'));

      await expect(ParticipantService.get('id')).rejects.toThrow(
        'Failed to get participant',
      );

      expect(ParticipantStore.get).toHaveBeenCalledWith('id');
    });
  });

  describe('update', () => {
    it('should generate the partial update and call the store update method with no updates', async () => {
      const participant = ParticipantGenerator.generateEntity();
      const participantUpdate = {
        ...participant,
        contactDetails: {
          emails: {
            add: [],
            update: participant.contactDetails.emails,
            remove: [],
          },
          phones: {
            add: [],
            update: participant.contactDetails.phones,
            remove: [],
          },
        },
        identification: {
          add: [],
          update: participant.identification,
          remove: [],
        },
        languages: {
          add: [],
          remove: [],
        },
        nationalities: {
          add: [],
          remove: [],
        },
      };
      ParticipantStore.get = jest.fn().mockResolvedValueOnce(participant);
      ParticipantStore.update = jest.fn().mockResolvedValueOnce(participant);

      const result = await ParticipantService.update(
        participant.id,
        participant,
      );

      expect(ParticipantStore.get).toHaveBeenCalledWith(participant.id);
      expect(ParticipantStore.update).toHaveBeenCalledWith(
        participant.id,
        participantUpdate,
      );
      expect(result).toEqual(participant);
    });

    it('should generate the partial update changing all fields', async () => {
      const originalParticipant = ParticipantGenerator.generateEntity({
        languages: [{ isoCode: 'es', translationKey: 'language__es' }],
        nationalities: [{ isoCode: 'es', translationKey: 'nationality__es' }],
      });
      const updatedParticipant = ParticipantGenerator.generateDefinition({
        languages: [{ isoCode: 'en' }],
        nationalities: [{ isoCode: 'en' }],
      });
      const participantUpdate = {
        ...updatedParticipant,
        contactDetails: {
          emails: {
            add: updatedParticipant.contactDetails.emails,
            update: [],
            remove: originalParticipant.contactDetails.emails.map(
              (cd) => cd.id,
            ),
          },
          phones: {
            add: updatedParticipant.contactDetails.phones,
            update: [],
            remove: originalParticipant.contactDetails.phones.map(
              (cd) => cd.id,
            ),
          },
        },
        identification: {
          add: updatedParticipant.identification,
          update: [],
          remove: originalParticipant.identification.map((id) => id.id),
        },
        languages: {
          add: [{ isoCode: 'en' }],
          remove: ['es'],
        },
        nationalities: {
          add: [{ isoCode: 'en' }],
          remove: ['es'],
        },
      };
      ParticipantStore.get = jest
        .fn()
        .mockResolvedValueOnce(originalParticipant);
      ParticipantStore.update = jest
        .fn()
        .mockResolvedValueOnce(updatedParticipant);

      const result = await ParticipantService.update(
        originalParticipant.id,
        updatedParticipant,
      );

      expect(ParticipantStore.get).toHaveBeenCalledWith(originalParticipant.id);
      expect(ParticipantStore.update).toHaveBeenCalledWith(
        originalParticipant.id,
        participantUpdate,
      );
      expect(result).toEqual(updatedParticipant);
    });

    it('should throw an error if the participant does not exist', async () => {
      ParticipantStore.get = jest.fn().mockResolvedValueOnce(null);

      await expect(
        ParticipantService.update(
          '12345',
          ParticipantGenerator.generateEntity(),
        ),
      ).rejects.toThrow('Participant with id 12345 not found');

      expect(ParticipantStore.get).toHaveBeenCalledWith('12345');
    });

    it('should throw an error if the store update method fails', async () => {
      const participant = ParticipantGenerator.generateEntity();
      ParticipantStore.get = jest.fn().mockResolvedValueOnce(participant);
      ParticipantStore.update = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to update participant'));

      await expect(
        ParticipantService.update(participant.id, participant),
      ).rejects.toThrow('Failed to update participant');
    });
  });
});

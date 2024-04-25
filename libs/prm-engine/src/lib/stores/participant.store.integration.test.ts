import { ulid } from 'ulidx';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';

import { ParticipantGenerator } from '@nrcno/core-test-utils';
import { getDb } from '@nrcno/core-db';

import { ParticipantStore } from './participant.store';

jest.mock('ulidx', () => ({
  ulid: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

function generateMockUlid() {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let mockUlid = '';
  for (let i = 0; i < 26; i++) {
    mockUlid += chars[Math.floor(Math.random() * chars.length)];
  }
  return mockUlid;
}

describe('Participant store', () => {
  beforeAll(async () => {
    getDb(undefined, (global as any).db);
  });

  describe('create', () => {
    test('should throw an AlredyExistsError when creating a participant that already exists', async () => {
      const participantDefinition = ParticipantGenerator.generateDefinition();
      const id = generateMockUlid();
      (ulid as jest.Mock).mockReturnValue(id);
      (v4 as jest.Mock).mockReturnValue(faker.string.uuid());

      const participant = await ParticipantStore.create(participantDefinition);
      expect(participant).toBeDefined();

      await expect(
        ParticipantStore.create(participantDefinition),
      ).rejects.toThrow(); // ulid is mocked to return the same value
    });
  });

  describe('get', () => {
    test('should return null if participant id does not exist', async () => {
      const participant = await ParticipantStore.get('non-existing-id');

      expect(participant).toBeNull();
    });
  });

  test('should create and get a participant', async () => {
    const participantDefinition = ParticipantGenerator.generateDefinition();
    const personId = generateMockUlid();
    const entityId = generateMockUlid();
    const participantId = generateMockUlid();
    const contactDetailsId = faker.string.uuid();
    const identificationId = faker.string.uuid();
    const expectedParticipant = ParticipantGenerator.generateEntity({
      ...participantDefinition,
      id: participantId,
      contactDetails: participantDefinition.contactDetails.map((cd) => ({
        ...cd,
        id: contactDetailsId,
      })),
      identification: participantDefinition.identification.map(
        (identification) => ({
          ...identification,
          id: identificationId,
        }),
      ),
      languages: participantDefinition.languages.map((lang) => ({
        ...lang,
        translationKey: `language__${lang.isoCode}`,
      })),
      nationalities: participantDefinition.nationalities.map((nat) => ({
        ...nat,
        translationKey: `nationality__${nat.isoCode}`,
      })),
    });

    (ulid as jest.Mock)
      .mockReturnValueOnce(personId)
      .mockReturnValueOnce(entityId)
      .mockReturnValueOnce(participantId);

    (v4 as jest.Mock)
      .mockReturnValueOnce(contactDetailsId)
      .mockReturnValueOnce(identificationId);

    const createdParticipant = await ParticipantStore.create(
      participantDefinition,
    );

    expect(createdParticipant).toEqual(expectedParticipant);

    const participant = await ParticipantStore.get(createdParticipant.id);

    expect(participant).toBeDefined();
    expect(participant).toEqual(expectedParticipant);
  });
});

import { ParticipantGenerator } from '@nrcno/core-test-entity-generator';
import { getDb } from '@nrcno/core-db';

import { ParticipantStore } from './participant.store';

describe('Participant store', () => {
  beforeAll(async () => {
    const config = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };
    getDb(config);
  });

  test('should create and get a participant', async () => {
    const createdParticipant = await ParticipantStore.create(
      ParticipantGenerator.generate(),
    );
    const participant = await ParticipantStore.get(createdParticipant.id);

    expect(participant).toBeDefined();
  });

  test('should return null if participant id does not exist', async () => {
    const participant = await ParticipantStore.get('non-existing-id');

    expect(participant).toBeNull();
  });
});

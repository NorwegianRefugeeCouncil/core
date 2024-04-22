import { ParticipantClient } from './participant.client';

describe('ParticipantClient', () => {
  it('should create an instance', () => {
    const client = new ParticipantClient({ baseURL: 'http://localhost:3000' });
    expect(client).toBeTruthy();
  });
});

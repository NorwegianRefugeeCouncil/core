import { PrmClient } from './prm.client';

describe('PrmClient', () => {
  it('should create an instance', () => {
    const client = new PrmClient({ baseURL: 'http://localhost:3000' });
    expect(client).toBeTruthy();
  });
});

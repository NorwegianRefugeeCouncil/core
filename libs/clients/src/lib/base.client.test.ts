import { BaseClient } from './base.client';

describe('coreClients', () => {
  it('should create an instance', () => {
    expect(new BaseClient({})).toBeTruthy();
  });
});

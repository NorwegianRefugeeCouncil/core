import { db } from './db';

describe('db lib', () => {
  test('db defined', () => {
    expect(db).toBeDefined();
  });
});

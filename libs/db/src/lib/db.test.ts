import { getDb } from './db';

describe('db lib', () => {
  test('db to be created', () => {
    const db = getDb({
      host: 'localhost',
      user: 'test',
      password: 'test',
      database: 'test',
    });
    expect(db).toBeDefined();
  });
});

import { getDb } from '@nrcno/core-db';

import { NationalityStore } from './nationality.store';

describe('Nationality store', () => {
  beforeAll(async () => {
    getDb(undefined, (global as any).db);
  });

  describe('list', () => {
    test('should return a list of nationalities', async () => {
      const result = await NationalityStore.list({
        startIndex: 0,
        pageSize: 50,
      });

      expect(result).toHaveLength(50);
      expect(result[0]).toEqual({
        id: 'ABW',
        enabled: true,
      });
      expect(result[1]).toEqual({
        id: 'AFG',
        enabled: true,
      });
    });
  });

  describe('count', () => {
    test('should return the count of nationalities', async () => {
      const result = await NationalityStore.count();

      expect(result).toBe(249);
    });
  });

  describe('get', () => {
    test('should return a country', async () => {
      const result = await NationalityStore.get('AFG');

      expect(result).toEqual({
        id: 'AFG',
        enabled: true,
      });
    });

    test('should return null if the country does not exist', async () => {
      const result = await NationalityStore.get('invalid');

      expect(result).toBeNull();
    });
  });
});

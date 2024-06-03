import { getDb } from '@nrcno/core-db';

import { LanguageStore } from './language.store';

describe('Language store', () => {
  beforeAll(async () => {
    getDb(undefined, (global as any).db);
  });

  describe('list', () => {
    test('should return a list of languages', async () => {
      const result = await LanguageStore.list({
        startIndex: 0,
        pageSize: 50,
      });

      expect(result).toHaveLength(50);
      expect(result[0]).toEqual({
        id: 'aaa',
        enabled: true,
      });
      expect(result[1]).toEqual({
        id: 'aab',
        enabled: true,
      });
    });
  });

  describe('count', () => {
    test('should return the count of languages', async () => {
      const result = await LanguageStore.count();

      expect(result).toBe(7910);
    });
  });
});

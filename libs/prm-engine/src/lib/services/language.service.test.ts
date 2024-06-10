import { EntityType } from '@nrcno/core-models';

import { LanguageStore } from '../stores/language.store';

import { LanguageService } from './language.service';
import { buildCountTests, buildListTests } from './test-utils';

jest.mock('../stores/language.store', () => ({
  LanguageStore: {
    list: jest.fn(),
    count: jest.fn(),
    get: jest.fn(),
  },
}));

describe('LanguageService', () => {
  buildListTests(EntityType.Language, LanguageService, LanguageStore);
  buildCountTests(EntityType.Language, LanguageService, LanguageStore);

  describe('validateIsoCode', () => {
    it('should throw an error if the value is not a valid language', async () => {
      const languageService = new LanguageService();
      const value = 'invalid';

      LanguageStore.get = jest.fn().mockResolvedValueOnce(null);

      await expect(languageService.validateIsoCode(value)).rejects.toThrow(
        `Invalid language: ${value}`,
      );
    });

    it('should throw an error if the value is a valid language but is not enabled', async () => {
      const languageService = new LanguageService();
      const value = 'aaa';

      LanguageStore.get = jest
        .fn()
        .mockResolvedValueOnce({ id: 'aaa', enabled: false });

      await expect(languageService.validateIsoCode(value)).rejects.toThrow(
        `Invalid language: ${value}`,
      );
    });

    it('should not throw an error if the value is a valid language', async () => {
      const languageService = new LanguageService();
      const value = 'aaa';

      LanguageStore.get = jest
        .fn()
        .mockResolvedValueOnce({ id: 'aaa', enabled: true });

      await expect(
        languageService.validateIsoCode(value),
      ).resolves.not.toThrow();
    });
  });
});

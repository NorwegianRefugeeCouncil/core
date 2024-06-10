import { EntityType } from '@nrcno/core-models';

import { NationalityStore } from '../stores/nationality.store';

import { NationalityService } from './nationality.service';
import { buildCountTests, buildListTests } from './test-utils';

jest.mock('../stores/nationality.store', () => ({
  NationalityStore: {
    list: jest.fn(),
    count: jest.fn(),
    get: jest.fn(),
  },
}));

describe('NationalityService', () => {
  buildListTests(EntityType.Nationality, NationalityService, NationalityStore);
  buildCountTests(EntityType.Nationality, NationalityService, NationalityStore);

  describe('validateIsoCode', () => {
    it('should throw an error if the value is not a valid country code', async () => {
      const nationalityService = new NationalityService();
      const value = 'invalid';

      NationalityStore.get = jest.fn().mockResolvedValueOnce(null);

      await expect(nationalityService.validateIsoCode(value)).rejects.toThrow(
        `Invalid nationality: ${value}`,
      );
    });

    it('should throw an error if the value is a valid country code but is not enabled', async () => {
      const nationalityService = new NationalityService();
      const value = 'AFG';

      NationalityStore.get = jest
        .fn()
        .mockResolvedValueOnce({ id: 'AFG', enabled: false });

      await expect(nationalityService.validateIsoCode(value)).rejects.toThrow(
        `Invalid nationality: ${value}`,
      );
    });

    it('should not throw an error if the value is a valid country code', async () => {
      const nationalityService = new NationalityService();
      const value = 'ALA';

      NationalityStore.get = jest
        .fn()
        .mockResolvedValueOnce({ id: 'ALA', enabled: true });

      await expect(
        nationalityService.validateIsoCode(value),
      ).resolves.not.toThrow();
    });
  });
});

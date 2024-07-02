import { HouseholdGenerator } from '@nrcno/core-test-utils';

import { HouseholdStore } from '../stores/household.store';

import { HouseholdService } from './household.service';
import { createTrx } from './utils';

jest.mock('../stores/household.store', () => ({
  HouseholdStore: {
    create: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    list: jest.fn(),
    count: jest.fn(),
  },
}));

jest.mock('./utils', () => ({
  createTrx: jest.fn().mockResolvedValue({
    rollback: jest.fn(),
    commit: jest.fn(),
  }),
}));

describe('Household service', () => {
  let householdService: HouseholdService;

  beforeEach(() => {
    householdService = new HouseholdService();
  });

  describe('create', () => {
    it('should call the store create method', async () => {
      const householdDefinition = HouseholdGenerator.generateDefinition();
      const household = HouseholdGenerator.generateEntity();
      HouseholdStore.create = jest.fn().mockResolvedValueOnce(household);

      const trx = await createTrx();
      const result = await householdService.create(householdDefinition, trx);

      expect(HouseholdStore.create).toHaveBeenCalledWith(
        householdDefinition,
        trx,
      );
      expect(result).toEqual(household);
    });

    it('should throw an error if the store create method fails', async () => {
      const householdDefinition = HouseholdGenerator.generateDefinition();

      HouseholdStore.create = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to create household'));
      const trx = await createTrx();

      await expect(
        householdService.create(householdDefinition, trx),
      ).rejects.toThrow('Failed to create household');

      expect(HouseholdStore.create).toHaveBeenCalledWith(
        householdDefinition,
        trx,
      );
    });
  });

  describe('get', () => {
    it('should call the store get method', async () => {
      const householdId = 'household-id';
      const household = HouseholdGenerator.generateEntity();
      HouseholdStore.get = jest.fn().mockResolvedValueOnce(household);

      const result = await householdService.get(householdId);

      expect(HouseholdStore.get).toHaveBeenCalledWith(householdId);
      expect(result).toEqual(household);
    });
  });

  describe('update', () => {
    it('should call the store update method with only the basic household fields', async () => {
      const householdUpdate = HouseholdGenerator.generateDefinition();
      const household = HouseholdGenerator.generateEntity();
      HouseholdStore.get = jest.fn().mockResolvedValueOnce(household);
      HouseholdStore.update = jest.fn().mockResolvedValueOnce(household);

      const result = await householdService.update(
        household.id,
        householdUpdate,
      );

      expect(HouseholdStore.update).toHaveBeenCalledWith(household.id, {
        headType: householdUpdate.headType,
        sizeOverride: householdUpdate.sizeOverride,
      });
      expect(result).toEqual(household);
    });

    it('should throw an error if the household does not exist', async () => {
      HouseholdStore.get = jest.fn().mockResolvedValueOnce(null);

      await expect(
        householdService.update('12345', HouseholdGenerator.generateEntity()),
      ).rejects.toThrow('Household with id 12345 not found');

      expect(HouseholdStore.get).toHaveBeenCalledWith('12345');
    });
  });
});

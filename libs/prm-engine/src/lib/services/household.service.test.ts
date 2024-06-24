import { HouseholdGenerator } from '@nrcno/core-test-utils';

import { HouseholdStore } from '../stores/household.store';

import { HouseholdService } from './household.service';

jest.mock('../stores/household.store', () => ({
  HouseholdStore: {
    create: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    list: jest.fn(),
    count: jest.fn(),
  },
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

      const result = await householdService.create(householdDefinition);

      expect(HouseholdStore.create).toHaveBeenCalledWith(householdDefinition);
      expect(result).toEqual(household);
    });

    it('should throw an error if the store create method fails', async () => {
      const householdDefinition = HouseholdGenerator.generateDefinition();

      HouseholdStore.create = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to create household'));

      await expect(
        householdService.create(householdDefinition),
      ).rejects.toThrow('Failed to create household');

      expect(HouseholdStore.create).toHaveBeenCalledWith(householdDefinition);
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
});

import { HouseholdGenerator } from '@nrcno/core-test-utils';
import { getDb } from '@nrcno/core-db';

import { HouseholdStore } from './household.store';

describe('Household store', () => {
  beforeAll(async () => {
    getDb(undefined, (global as any).db);
  });

  afterEach(async () => {
    // TODO: implement cleaning up the database after each test in a better way.
    // Either move this to a global jest test setup or use a transaction for each test
    const db = getDb();
    await db.raw('TRUNCATE TABLE households CASCADE');
  });

  describe('create', () => {
    test('should create and get a household', async () => {
      const householdDefinition = HouseholdGenerator.generateDefinition();
      const expectedHousehold = {
        ...householdDefinition,
        id: expect.any(String),
        individuals: [],
      };

      const createdHousehold = await HouseholdStore.create(householdDefinition);

      expect(createdHousehold).toEqual(expectedHousehold);

      const household = await HouseholdStore.get(createdHousehold.id);

      expect(household).toBeDefined();
      expect(household).toEqual(expectedHousehold);
    });
  });

  describe('get', () => {
    test('should return null if household id does not exist', async () => {
      const household = await HouseholdStore.get('non-existing-id');

      expect(household).toBeNull();
    });
  });

  describe('update', () => {
    test('should update a household', async () => {
      const householdDefinition = HouseholdGenerator.generateDefinition({
        sizeOverride: 3,
      });
      const createdHousehold = await HouseholdStore.create(householdDefinition);

      const updatedHousehold = await HouseholdStore.update(
        createdHousehold.id,
        {
          sizeOverride: 5,
        },
      );

      expect(updatedHousehold).toEqual({
        ...createdHousehold,
        sizeOverride: 5,
      });
    });
  });
});

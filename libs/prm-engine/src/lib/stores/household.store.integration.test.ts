import { HouseholdGenerator } from '@nrcno/core-test-utils';
import { getDb } from '@nrcno/core-db';
import { SortingDirection } from '@nrcno/core-models';

import { HouseholdStore } from './household.store';

jest.mock('ulidx', () => {
  const realUlid = jest.requireActual('ulidx').ulid;
  return {
    ulid: jest.fn().mockImplementation(() => realUlid()),
  };
});

jest.mock('uuid', () => {
  const realUuid = jest.requireActual('uuid').v4;
  return {
    v4: jest.fn().mockImplementation(() => realUuid()),
  };
});

function generateMockUlid() {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let mockUlid = '';
  for (let i = 0; i < 26; i++) {
    mockUlid += chars[Math.floor(Math.random() * chars.length)];
  }
  return mockUlid;
}

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

  describe.skip('create', () => {
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

  describe('list', () => {
    test('should return a list of households', async () => {
      const householdDefinition = HouseholdGenerator.generateDefinition();
      const household = await HouseholdStore.create(householdDefinition);

      const households = await HouseholdStore.list({
        startIndex: 0,
        pageSize: 50,
      });

      expect(households).toBeDefined();
      expect(households).toHaveLength(1);
      expect(households[0]).toEqual({
        id: household.id,
        headType: household.headType,
        sizeOverride: household.sizeOverride,
        individuals: [],
      });
    });

    test('should return a paginated list of households, sorted by id by default', async () => {
      const householdDefinition = HouseholdGenerator.generateDefinition();
      const household1 = await HouseholdStore.create(householdDefinition);
      const household2 = await HouseholdStore.create(householdDefinition);
      const expectedFirstHouseholdId =
        household1.id < household2.id ? household1.id : household2.id;

      const households = await HouseholdStore.list({
        startIndex: 0,
        pageSize: 1,
      });

      expect(households).toBeDefined();
      expect(households).toHaveLength(1);
      expect(households[0].id).toEqual(expectedFirstHouseholdId);
    });
  });
});

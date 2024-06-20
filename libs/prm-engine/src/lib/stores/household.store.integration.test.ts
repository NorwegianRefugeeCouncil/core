import { ulid } from 'ulidx';
import { v4 } from 'uuid';
import { faker } from '@faker-js/faker';

import { HouseholdGenerator } from '@nrcno/core-test-utils';
import { getDb } from '@nrcno/core-db';

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

describe.skip('Household store', () => {
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
      const householdId = generateMockUlid();
      const contactDetailsIdPhone = faker.string.uuid();
      const identificationId = faker.string.uuid();
      const expectedHousehold = HouseholdGenerator.generateEntity({
        ...householdDefinition,
        id: householdId,
        individuals: [],
      });

      (ulid as jest.Mock).mockReturnValueOnce(householdId);

      (v4 as jest.Mock)
        .mockReturnValueOnce(contactDetailsIdPhone)
        .mockReturnValueOnce(identificationId);

      const createdHousehold = await HouseholdStore.create(householdDefinition);

      expect(createdHousehold).toEqual(expectedHousehold);

      const household = await HouseholdStore.get(createdHousehold.id);

      expect(household).toBeDefined();
      expect(household).toEqual(expectedHousehold);
    });
  });
});

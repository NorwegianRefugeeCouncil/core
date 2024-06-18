import { ulid } from 'ulidx';

import {
  HouseholdDefinition,
  HouseholdSchema,
  Household,
  Pagination,
} from '@nrcno/core-models';
import { PostgresError, PostgresErrorCode, getDb } from '@nrcno/core-db';
import { AlreadyExistsError } from '@nrcno/core-errors';

import { BaseStore } from './base.store';

export type IHouseholdStore = BaseStore<
  HouseholdDefinition,
  Household,
  any,
  any,
  any
>;

const create: IHouseholdStore['create'] = async (
  householdDefinition: HouseholdDefinition,
): Promise<Household> => {
  const db = getDb();

  const householdId = ulid();

  const result = await db.transaction(async (trx) => {
    try {
      await trx('households').insert({
        ...householdDefinition,
        id: householdId,
      });

      const createdHousehold = HouseholdSchema.safeParse({
        ...householdDefinition,
        id: householdId,
      });

      if (createdHousehold.error) {
        throw new Error(
          `Corrupt data in database for households: ${createdHousehold.error.errors.join(', ')}`,
        );
      }
      return createdHousehold.data;
    } catch (error) {
      if ((error as PostgresError).code === PostgresErrorCode.UniqueViolation) {
        throw new AlreadyExistsError('Household already exists');
      }
      throw error;
    }
  });

  return result;
};

export const HouseholdStore: IHouseholdStore = {
  create,
  get: function (id: string): Promise<Household | null> {
    throw new Error('Function not implemented.');
  },
  update: function (id: string, entity: any): Promise<Household> {
    throw new Error('Function not implemented.');
  },
  count: function (filtering?: any): Promise<number> {
    throw new Error('Function not implemented.');
  },
  list: function (p: Pagination): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

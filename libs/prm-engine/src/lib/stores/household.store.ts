import { ulid } from 'ulidx';

import {
  HouseholdDefinition,
  HouseholdSchema,
  Household,
  Pagination,
  HouseholdPartialUpdate,
} from '@nrcno/core-models';
import { PostgresError, PostgresErrorCode, getDb } from '@nrcno/core-db';
import { AlreadyExistsError, NotFoundError } from '@nrcno/core-errors';

import { BaseStore } from './base.store';

export type IHouseholdStore = BaseStore<
  HouseholdDefinition,
  Household,
  HouseholdPartialUpdate,
  any,
  any
>;

const create: IHouseholdStore['create'] = async (
  householdDefinition: HouseholdDefinition,
): Promise<Household> => {
  const db = getDb();

  const householdId = ulid();

  const { individuals, ...householdDetails } = householdDefinition;

  const result = await db.transaction(async (trx) => {
    try {
      await trx('households').insert({
        ...householdDetails,
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
        throw new AlreadyExistsError(
          'Either an individual has already been registered in another household, or you are trying to set multiple individuals as head of household.',
        );
      }
      throw error;
    }
  });

  return result;
};

const get: IHouseholdStore['get'] = async (
  id: string,
): Promise<Household | null> => {
  const db = getDb();

  const household = await db('households').where({ id }).first();

  if (!household) {
    return null;
  }
  const parsedHousehold = HouseholdSchema.safeParse(household);
  if (parsedHousehold.error) {
    throw new Error(
      `Corrupt data in database for household: ${parsedHousehold.error.errors.join(', ')}`,
    );
  }

  return parsedHousehold.data;
};

const update: IHouseholdStore['update'] = async (
  id: string,
  householdUpdate: HouseholdPartialUpdate,
): Promise<Household> => {
  const db = getDb();

  await db('households').where({ id }).update(householdUpdate);

  const updatedHousehold = await get(id);

  if (!updatedHousehold) {
    throw new NotFoundError('Household that was updated not found');
  }

  return updatedHousehold;
};

export const HouseholdStore: IHouseholdStore = {
  create,
  get,
  update,
  count: function (filtering?: any): Promise<number> {
    throw new Error('Function not implemented.');
  },
  list: function (p: Pagination): Promise<any[]> {
    throw new Error('Function not implemented.');
  },
};

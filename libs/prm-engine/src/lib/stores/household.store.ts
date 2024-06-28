import { ulid } from 'ulidx';
import { z } from 'zod';

import {
  HouseholdDefinition,
  HouseholdSchema,
  Household,
  Pagination,
  createSortingSchema,
  EntityType,
  HouseholdFiltering,
  HouseholdListItemSchema,
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

const list: IHouseholdStore['list'] = async (
  pagination: Pagination,
  { sort, direction } = createSortingSchema(EntityType.Household).parse({}),
  filtering: HouseholdFiltering = {},
) => {
  const db = getDb();

  const rows = await db('households')
    .select([
      'households.id',
      'households.head_type',
      'households.size_override',
      'household_individuals.individual_id as headId',
    ])
    .leftJoin(
      'household_individuals',
      'households.id',
      'household_individuals.household_id',
    )
    .where((builder) => {
      // TODO - uncomment this line and remove null check when we have a head of household
      // builder.where('household_individuals.is_head_of_household', true);
      builder.whereNull('household_individuals.individual_id');

      if (filtering.id) {
        builder.where('households.id', filtering.id);
      }
      if (filtering.headType) {
        builder.where('households.head_type', filtering.headType);
      }
      if (filtering.sizeOverrideMin) {
        builder.where(
          'households.size_override',
          '>=',
          filtering.sizeOverrideMin,
        );
      }
      if (filtering.sizeOverrideMax) {
        builder.where(
          'households.size_override',
          '<=',
          filtering.sizeOverrideMax,
        );
      }
    })
    .limit(pagination.pageSize)
    .offset(pagination.startIndex)
    .orderBy(sort, direction);

  return z.array(HouseholdListItemSchema).parse(
    rows.map((row) => ({
      id: row.id,
      headType: row.headType,
      sizeOverride: row.sizeOverride,
      individuals: row.headId
        ? [
            {
              id: row.headId,
              isHeadOfHousehold: true,
            },
          ]
        : [],
    })),
  );
};

const count: IHouseholdStore['count'] = async (
  filtering: HouseholdFiltering = {},
): Promise<number> => {
  const db = getDb();

  const [{ count }] = await db('households')
    .count()
    .leftJoin(
      'household_individuals',
      'households.id',
      'household_individuals.household_id',
    )
    .where((builder) => {
      if (filtering.id) {
        builder.where('households.id', filtering.id);
      }
      if (filtering.headType) {
        builder.where('households.head_type', filtering.headType);
      }
      if (filtering.sizeOverrideMin) {
        builder.where(
          'households.size_override',
          '>=',
          filtering.sizeOverrideMin,
        );
      }
      if (filtering.sizeOverrideMax) {
        builder.where(
          'households.size_override',
          '<=',
          filtering.sizeOverrideMax,
        );
      }
    });

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

export const HouseholdStore: IHouseholdStore = {
  create,
  get,
  list,
  count,
  update: function (id: string, entity: any): Promise<Household> {
    throw new Error('Function not implemented.');
  },
};

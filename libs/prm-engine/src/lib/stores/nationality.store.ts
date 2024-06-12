import { z } from 'zod';
import { Knex } from 'knex';

import {
  EntityType,
  Nationality,
  NationalityFilter,
  NationalitySchema,
  Pagination,
  Sorting,
  createSortingSchema,
} from '@nrcno/core-models';
import { getDb } from '@nrcno/core-db';

import { ListStore, GetStore } from './base.store';

export interface INationalityStore
  extends ListStore<Nationality, NationalityFilter>,
    GetStore<Nationality> {}

const buildFilterQuery =
  (filtering: NationalityFilter) => (builder: Knex.QueryBuilder) => {
    if (filtering.enabled !== undefined) {
      builder.where('enabled', filtering.enabled);
    }
  };

const list: INationalityStore['list'] = async (
  pagination: Pagination,
  { sort, direction }: Sorting = createSortingSchema(
    EntityType.Nationality,
  ).parse({}),
  filtering: NationalityFilter = {},
): Promise<Nationality[]> => {
  const db = getDb();

  const nationalities = await db('nationalities')
    .select('*')
    .where(buildFilterQuery(filtering))
    .limit(pagination.pageSize)
    .offset(pagination.startIndex)
    .orderBy(sort, direction);

  return z.array(NationalitySchema).parse(nationalities);
};

const count: INationalityStore['count'] = async (
  filtering: NationalityFilter = {},
): Promise<number> => {
  const db = getDb();

  const [{ count }] = await db('nationalities')
    .where(buildFilterQuery(filtering))
    .count();

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

const get: INationalityStore['get'] = async (
  id: string,
): Promise<Nationality | null> => {
  const db = getDb();
  const nationality = await db('nationalities').where('id', id).first();

  return nationality ? NationalitySchema.parse(nationality) : null;
};

export const NationalityStore: INationalityStore = {
  list,
  count,
  get,
};

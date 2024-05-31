import { z } from 'zod';

import {
  Nationality,
  NationalityFilter,
  NationalitySchema,
  Pagination,
} from '@nrcno/core-models';
import { getDb } from '@nrcno/core-db';

import { ListStore } from './base.store';

export type INationalityStore = ListStore<Nationality, NationalityFilter>;

const list: INationalityStore['list'] = async (
  pagination: Pagination,
): Promise<Nationality[]> => {
  const db = getDb();

  const nationalities = await db('nationalities')
    .select('*')
    .limit(pagination.pageSize)
    .offset(pagination.startIndex)
    .orderBy('id');

  return z.array(NationalitySchema).parse(nationalities);
};

const count: INationalityStore['count'] = async (): Promise<number> => {
  const db = getDb();

  const [{ count }] = await db('nationalities').count();

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

export const NationalityStore: INationalityStore = {
  list,
  count,
};

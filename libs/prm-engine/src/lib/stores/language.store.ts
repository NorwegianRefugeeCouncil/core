import { z } from 'zod';
import { Knex } from 'knex';

import {
  EntityType,
  Language,
  LanguageFilter,
  LanguageSchema,
  Pagination,
  Sorting,
  createSortingSchema,
} from '@nrcno/core-models';
import { getDb } from '@nrcno/core-db';

import { ListStore } from './base.store';

export type ILanguageStore = ListStore<Language, LanguageFilter>;

const buildFilterQuery =
  (filtering: LanguageFilter) => (builder: Knex.QueryBuilder) => {
    if (filtering.enabled !== undefined) {
      builder.where('enabled', filtering.enabled);
    }
  };

const list: ILanguageStore['list'] = async (
  pagination: Pagination,
  { sort, direction }: Sorting = createSortingSchema(EntityType.Language).parse(
    {},
  ),
  filtering: LanguageFilter = {},
): Promise<Language[]> => {
  const db = getDb();

  const languages = await db('languages')
    .select('*')
    .where(buildFilterQuery(filtering))
    .limit(pagination.pageSize)
    .offset(pagination.startIndex)
    .orderBy(sort, direction);

  return z.array(LanguageSchema).parse(languages);
};

const count: ILanguageStore['count'] = async (
  filtering: LanguageFilter = {},
): Promise<number> => {
  const db = getDb();

  const [{ count }] = await db('languages')
    .where(buildFilterQuery(filtering))
    .count();

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

export const LanguageStore: ILanguageStore = {
  list,
  count,
};

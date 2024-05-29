import { z } from 'zod';

import {
  Language,
  LanguageFilter,
  LanguageSchema,
  Pagination,
} from '@nrcno/core-models';
import { getDb } from '@nrcno/core-db';

import { ListStore } from './base.store';

export type ILanguageStore = ListStore<Language, LanguageFilter>;

const list: ILanguageStore['list'] = async (
  pagination: Pagination,
): Promise<Language[]> => {
  const db = getDb();

  const languages = await db('languages')
    .select('*')
    .limit(pagination.pageSize)
    .offset(pagination.startIndex)
    .orderBy('id');

  return z.array(LanguageSchema).parse(languages);
};

const count: ILanguageStore['count'] = async (): Promise<number> => {
  const db = getDb();

  const [{ count }] = await db('languages').count();

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

export const LanguageStore: ILanguageStore = {
  list,
  count,
};

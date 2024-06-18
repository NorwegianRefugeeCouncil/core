import { z } from 'zod';
import { v4 as uuid } from 'uuid';

import { getDb } from '@nrcno/core-db';
import {
  Pagination,
  Position,
  PositionDefinition,
  PositionListItem,
  PositionPartialUpdate,
  PositionSchema,
} from '@nrcno/core-models';

export interface IPositionStore {
  create: (position: PositionDefinition) => Promise<Position>;
  get: (positionId: string) => Promise<Position | null>;
  list: (pagination: Pagination) => Promise<PositionListItem[]>;
  update: (
    positionId: string,
    partialPosition: PositionPartialUpdate,
  ) => Promise<Position>;
  del: (positionId: string) => Promise<void>;
  count: () => Promise<number>;
}

const create: IPositionStore['create'] = async (position) => {
  const db = getDb();

  const result = await db('positions')
    .insert({
      ...position,
      id: uuid(),
    })
    .returning('*');

  return PositionSchema.parse(result[0]);
};

const get: IPositionStore['get'] = async (positionId) => {
  const db = getDb();

  const result = await db('positions').where('id', positionId).first();

  if (!result) {
    return null;
  }

  return PositionSchema.parse(result);
};

const list: IPositionStore['list'] = async (pagination) => {
  const db = getDb();

  const result = await db('positions')
    .limit(pagination.pageSize)
    .offset(pagination.startIndex);

  return z.array(PositionSchema).parse(result);
};

const update: IPositionStore['update'] = async (
  positionId,
  partialPosition,
) => {
  const db = getDb();

  const result = await db('positions')
    .where('id', positionId)
    .update(partialPosition)
    .returning('*');

  return PositionSchema.parse(result[0]);
};

const del: IPositionStore['del'] = async (positionId) => {
  const db = getDb();

  await db('positions').where('id', positionId).del();
};

const count: IPositionStore['count'] = async () => {
  const db = getDb();

  const [{ count }] = await db('positions').count();

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

export const PositionStore: IPositionStore = {
  create,
  get,
  list,
  update,
  del,
  count,
};

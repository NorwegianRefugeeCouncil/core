import { z } from 'zod';
import { v4 as uuid } from 'uuid';

import { getDb } from '@nrcno/core-db';
import {
  Pagination,
  Position,
  PositionDefinition,
  PositionListItem,
  PositionListItemSchema,
  PositionPartialUpdate,
  Roles,
} from '@nrcno/core-models';

type PositionWithStaffIds = Omit<Position, 'staff'> & { staff: string[] };

export interface IPositionStore {
  create: (position: PositionDefinition) => Promise<PositionWithStaffIds>;
  get: (positionId: string) => Promise<PositionWithStaffIds | null>;
  list: (pagination: Pagination) => Promise<PositionListItem[]>;
  update: (
    positionId: string,
    partialPosition: PositionPartialUpdate,
  ) => Promise<void>;
  del: (positionId: string) => Promise<void>;
  count: () => Promise<number>;
  listByIds: (ids: string[]) => Promise<PositionListItem[]>;
}

const create: IPositionStore['create'] = async (position) => {
  const db = getDb();

  const { staff, roles, ...positionDetails } = position;

  const result = await db('positions')
    .insert({
      ...positionDetails,
      id: uuid(),
    })
    .returning('*');

  const positionId = result[0].id;

  if (staff.length > 0) {
    await db('position_user_assignments').insert(
      staff.map((userId) => ({
        positionId: positionId,
        userId: userId,
      })),
    );
  }

  if (Object.values(roles).some((enabled) => enabled)) {
    await db('position_roles').insert(
      Object.entries(roles)
        .filter(([, enabled]) => enabled)
        .map(([role]) => ({
          positionId: positionId,
          role,
        })),
    );
  }

  return {
    ...result[0],
    roles,
    staff,
  };
};

const get: IPositionStore['get'] = async (positionId) => {
  const db = getDb();

  const [position, staffIds, roles] = await Promise.all([
    db('positions').where('id', positionId).first(),
    db('position_user_assignments')
      .where('positionId', positionId)
      .select('userId'),
    db('position_roles').where('positionId', positionId).select('role'),
  ]);

  if (!position) {
    return null;
  }

  return {
    ...position,
    staff: staffIds.map((row) => row.userId),
    roles: Object.values(Roles).reduce(
      (acc, role) => ({
        ...acc,
        [role]: roles.some((r) => r.role === role),
      }),
      {} as Record<Roles, boolean>,
    ),
  };
};

const list: IPositionStore['list'] = async (pagination) => {
  const db = getDb();

  const result = await db('positions')
    .limit(pagination.pageSize)
    .offset(pagination.startIndex);

  return z.array(PositionListItemSchema).parse(result);
};

const update: IPositionStore['update'] = async (
  positionId,
  partialPositionUpdate,
) => {
  const db = getDb();

  const {
    staff: { add: staffToAdd = [], remove: staffToRemove = [] },
    roles: { add: rolesToAdd = [], remove: rolesToRemove = [] },
    ...positionDetails
  } = partialPositionUpdate;

  await db('positions').where('id', positionId).update(positionDetails);

  if (staffToAdd.length > 0) {
    await db('position_user_assignments').insert(
      staffToAdd.map((userId) => ({
        positionId: positionId,
        userId: userId,
      })),
    );
  }

  if (staffToRemove.length > 0) {
    await db('position_user_assignments')
      .where('positionId', positionId)
      .whereIn('userId', staffToRemove)
      .del();
  }

  if (rolesToAdd.length > 0) {
    await db('position_roles').insert(
      rolesToAdd.map((role) => ({
        positionId: positionId,
        role,
      })),
    );
  }

  if (rolesToRemove.length > 0) {
    await db('position_roles')
      .where('positionId', positionId)
      .whereIn('role', rolesToRemove)
      .del();
  }
};

const del: IPositionStore['del'] = async (positionId) => {
  const db = getDb();

  await db('positions').where('id', positionId).del();
  await db('position_user_assignments').where('positionId', positionId).del();
  await db('position_roles').where('positionId', positionId).del();
};

const count: IPositionStore['count'] = async () => {
  const db = getDb();

  const [{ count }] = await db('positions').count();

  return typeof count === 'string' ? parseInt(count, 10) : count;
};

const listByIds = async (ids: string[]) => {
  const db = getDb();

  const positions = await db('positions').whereIn('id', ids);

  return z.array(PositionListItemSchema).parse(positions);
};

export const PositionStore: IPositionStore = {
  create,
  get,
  list,
  update,
  del,
  count,
  listByIds,
};

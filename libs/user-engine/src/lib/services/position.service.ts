import {
  Pagination,
  Position,
  PositionDefinition,
  PositionListItem,
  PositionSchema,
  PositionUpdate,
  Roles,
} from '@nrcno/core-models';
import { getTrx } from '@nrcno/core-db';

import { PositionStore } from '../stores/position.store';

import { UserService } from './user.service';

export interface IPositionService {
  create: (position: PositionDefinition) => Promise<Position>;
  get: (positionId: string) => Promise<Position | null>;
  list: (pagination: Pagination) => Promise<PositionListItem[]>;
  update: (
    positionId: string,
    partialPosition: PositionUpdate,
  ) => Promise<Position>;
  del: (positionId: string) => Promise<void>;
  count: () => Promise<number>;
  listByIds: (ids: string[]) => Promise<PositionListItem[]>;
}

const create: IPositionService['create'] = async (position) => {
  const trx = await getTrx();

  try {
    const createdPosition = await PositionStore.create(position, trx);
    const staff =
      position.staff.length > 0
        ? await UserService.search('id', position.staff)
        : [];
    const validatedCreatedPosition = PositionSchema.parse({
      ...createdPosition,
      staff,
    });

    await trx.commit();

    return validatedCreatedPosition;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

const get: IPositionService['get'] = async (positionId) => {
  const position = await PositionStore.get(positionId);
  if (!position) {
    return null;
  }
  const staff =
    position.staff.length > 0
      ? await UserService.search('id', position.staff)
      : [];
  return PositionSchema.parse({
    ...position,
    staff,
  });
};

const list: IPositionService['list'] = async (pagination) => {
  return PositionStore.list(pagination);
};

const update: IPositionService['update'] = async (
  positionId,
  positionUpdate,
) => {
  const trx = await getTrx();

  try {
    const existingPosition = await PositionStore.get(positionId);
    if (!existingPosition) {
      throw new Error('Position not found');
    }

    const positionPartialUpdate = {
      ...positionUpdate,
      staff: {
        add: positionUpdate.staff.filter((id) =>
          existingPosition.staff.every((staffId) => staffId !== id),
        ),
        remove: existingPosition.staff.filter((id) =>
          positionUpdate.staff.every((staffId) => staffId !== id),
        ),
      },
      roles: {
        add: Object.values(Roles).filter(
          (role) =>
            positionUpdate.roles?.[role] &&
            positionUpdate.roles[role] !== existingPosition.roles[role],
        ),
        remove: Object.values(Roles).filter(
          (role) =>
            !positionUpdate.roles?.[role] &&
            positionUpdate.roles[role] !== existingPosition.roles[role],
        ),
      },
    };

    await PositionStore.update(positionId, positionPartialUpdate, trx);

    const position = await get(positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    await trx.commit();

    return position;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

const del: IPositionService['del'] = async (positionId) => {
  const trx = await getTrx();

  try {
    await PositionStore.del(positionId, trx);
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};

const count: IPositionService['count'] = async () => {
  return PositionStore.count();
};

const listByIds: IPositionService['listByIds'] = async (ids) => {
  return PositionStore.listByIds(ids);
};

export const PositionService: IPositionService = {
  create,
  get,
  list,
  update,
  del,
  count,
  listByIds,
};

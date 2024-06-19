import {
  Pagination,
  Position,
  PositionDefinition,
  PositionListItem,
  PositionSchema,
  PositionUpdate,
} from '@nrcno/core-models';

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
}

const create: IPositionService['create'] = async (position) => {
  const createdPosition = await PositionStore.create(position);
  const staff =
    position.staff.length > 0
      ? await UserService.search('id', position.staff)
      : [];
  return PositionSchema.parse({
    ...createdPosition,
    staff,
  });
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
  };
  await PositionStore.update(positionId, positionPartialUpdate);
  const position = await get(positionId);
  if (!position) {
    throw new Error('Position not found');
  }
  return position;
};

const del: IPositionService['del'] = async (positionId) => {
  return PositionStore.del(positionId);
};

const count: IPositionService['count'] = async () => {
  return PositionStore.count();
};

export const PositionService: IPositionService = {
  create,
  get,
  list,
  update,
  del,
  count,
};

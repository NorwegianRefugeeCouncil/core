import {
  Pagination,
  Position,
  PositionDefinition,
  PositionListItem,
  PositionPartialUpdate,
} from '@nrcno/core-models';

import { PositionStore } from '../stores/position.store';

export interface IPositionService {
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

const create: IPositionService['create'] = async (position) => {
  return PositionStore.create(position);
};

const get: IPositionService['get'] = async (positionId) => {
  return PositionStore.get(positionId);
};

const list: IPositionService['list'] = async (pagination) => {
  return PositionStore.list(pagination);
};

const update: IPositionService['update'] = async (
  positionId,
  partialPosition,
) => {
  return PositionStore.update(positionId, partialPosition);
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

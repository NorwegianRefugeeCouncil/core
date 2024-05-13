import {
  EntityType,
  Pagination,
  Participant,
  ParticipantDefinition,
  ParticipantListItem,
  ParticipantUpdate,
} from '@nrcno/core-models';

import { PrmStore } from '../stores';

export type PrmService<
  TDefinition,
  TEntity,
  TUpdateDefinition,
  TEntityListItem,
> = {
  count: () => Promise<number>;
  create: (entity: TDefinition) => Promise<TEntity>;
  get: (id: string) => Promise<TEntity | null>;
  update: (id: string, entity: TUpdateDefinition) => Promise<TEntity>;
  list: (pagination: Pagination) => Promise<TEntityListItem[]>;
};

export function getPrmService(
  entityType: EntityType.Participant,
): PrmService<
  ParticipantDefinition,
  Participant,
  ParticipantUpdate,
  ParticipantListItem
>;
export function getPrmService(
  entityType: EntityType,
): PrmService<any, any, any, any> {
  const Store = PrmStore[entityType];

  if (!Store) {
    throw new Error(`Entity type "${entityType}" is not supported`);
  }

  const count = async () => {
    return Store.count();
  };

  const create = async (entity: any) => {
    return Store.create(entity);
  };

  const get = async (id: string) => {
    return Store.get(id);
  };

  const update = async (id: string, entity: any) => {
    return Store.update(id, entity);
  };

  const list = async (pagination: Pagination) => {
    return Store.list(pagination);
  };

  return { count, create, get, update, list };
}

import {
  EntityType,
  Participant,
  ParticipantDefinition,
  ParticipantUpdate,
} from '@nrcno/core-models';

import { PrmStore } from '../stores';

export type PrmService<TDefinition, TEntity, TUpdateDefinition> = {
  create: (entity: TDefinition) => Promise<TEntity>;
  get: (id: string) => Promise<TEntity | null>;
  update: (id: string, entity: TUpdateDefinition) => Promise<TEntity>;
};

export function getPrmService(
  entityType: EntityType.Participant,
): PrmService<ParticipantDefinition, Participant, ParticipantUpdate>;
export function getPrmService(
  entityType: EntityType,
): PrmService<any, any, any> {
  const Store = PrmStore[entityType];

  if (!Store) {
    throw new Error(`Entity type "${entityType}" is not supported`);
  }

  const create = async (entity: any) => {
    return Store.create(entity);
  };

  const get = async (id: string) => {
    return Store.get(id);
  };

  const update = async (id: string, entity: any) => {
    return Store.update(id, entity);
  };

  return { create, get, update };
}

import {
  EntityType,
  Participant,
  ParticipantDefinition,
} from '@nrcno/core-models';

import { PrmStore } from '../stores';

export type PrmService<T, U> = {
  create: (entity: T) => Promise<U>;
  get: (id: string) => Promise<U>;
};

export function getPrmService(
  entityType: EntityType.Participant,
): PrmService<ParticipantDefinition, Participant>;
export function getPrmService(entityType: EntityType): PrmService<any, any> {
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

  return { create, get };
}

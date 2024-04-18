import {
  EntityType,
  Participant,
  ParticipantDefinition,
} from '@nrcno/core-models';

import { PrmStore } from '../stores';

export type PrmService<T, U> = {
  create: (entity: T) => Promise<U>;
};

export function getPrmService(
  entityType: EntityType.Participant,
): PrmService<ParticipantDefinition, Participant>;
export function getPrmService(entityType: EntityType): PrmService<any, any> {
  const Store = PrmStore[entityType];

  const create = async (entity: any) => {
    return Store.create(entity);
  };

  return { create };
}

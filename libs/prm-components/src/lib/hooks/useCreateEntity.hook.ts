import { PrmClient } from '@nrcno/core-clients';
import { Entity, EntityDefinition, EntityType } from '@nrcno/core-models';

import { SubmitStatus, useApiReducer } from './useApiReducer.hook';

export type CreateEntityState = {
  onCreateEntity: (entityDefinition: EntityDefinition) => Promise<Entity>;
  reset: () => void;
  status: SubmitStatus;
  data?: Entity;
  error?: Error;
};

export const defaultCreateEntityState: CreateEntityState = {
  onCreateEntity: async () => Promise.reject(),
  reset: () => {
    return;
  },
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

export const useCreateEntity = (
  client: PrmClient[EntityType] | undefined,
): CreateEntityState => {
  const [state, actions] = useApiReducer<Entity>();

  const onCreateEntity = async (
    entityDefinition: EntityDefinition,
  ): Promise<Entity> => {
    if (!client) {
      throw new Error('Client is not defined');
    }
    try {
      actions.submitting();
      const entity = await client.create(entityDefinition);
      actions.success(entity);
      return entity;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
      throw err;
    }
  };

  return {
    onCreateEntity,
    reset: actions.reset,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

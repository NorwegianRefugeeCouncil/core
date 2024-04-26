import { PrmClient } from '@nrcno/core-clients';
import { EntityType, Entity } from '@nrcno/core-models';

import { SubmitStatus, useApiReducer } from './useApiReducer.hook';

export type ReadEntityState = {
  loadEntity: (entityId: string) => Promise<void>;
  status: SubmitStatus;
  data?: Entity;
  error?: Error;
};

export const defaultReadEntityState: ReadEntityState = {
  loadEntity: async (entityId: string) => Promise.resolve(),
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

export const useReadEntity = (
  client: PrmClient[EntityType] | undefined,
): ReadEntityState => {
  const [state, actions] = useApiReducer<Entity>();

  const loadEntity = async (entityId: string) => {
    if (!client) {
      throw new Error('Client is not defined');
    }
    try {
      actions.submitting();
      const entity = await client.read(entityId);
      actions.success(entity);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
    }
  };

  return {
    loadEntity,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

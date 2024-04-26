import { PrmClient } from '@nrcno/core-clients';
import { EntityType } from '@nrcno/core-models';

import { SubmitStatus, useApiReducer } from '../types';

export type ReadEntityState = {
  loadEntity: (entityId: string) => Promise<void>;
  status: SubmitStatus;
  data?: any;
  error?: Error;
};

export const defaultReadEntityState: ReadEntityState = {
  loadEntity: async (entityId: string) => Promise.resolve(),
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

// WARNING: This may break as we add more entity types
type Data = Awaited<ReturnType<PrmClient[EntityType]['read']>>;

export const useReadEntity = (
  client: PrmClient[EntityType] | undefined,
): ReadEntityState => {
  const [state, actions] = useApiReducer<Data>();

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

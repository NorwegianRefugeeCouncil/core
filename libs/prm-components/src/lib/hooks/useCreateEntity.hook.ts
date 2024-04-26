import { PrmClient } from '@nrcno/core-clients';
import { EntityType } from '@nrcno/core-models';

import { SubmitStatus, useApiReducer } from '../types';

export type CreateEntityState = {
  onCreateEntity: (entityDefinition: any) => Promise<any>;
  status: SubmitStatus;
  data?: any;
  error?: Error;
};

export const defaultCreateEntityState: CreateEntityState = {
  onCreateEntity: async () => Promise.resolve(),
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

// WARNING: This may break as we add more entity types
type Data = Awaited<ReturnType<PrmClient[EntityType]['create']>>;

export const useCreateEntity = (
  client: PrmClient[EntityType] | undefined,
): CreateEntityState => {
  const [state, actions] = useApiReducer<Data>();

  const onCreateEntity = async (entityDefinition: any) => {
    if (!client) {
      throw new Error('Client is not defined');
    }
    try {
      actions.submitting();
      const entity = await client.create(entityDefinition);
      actions.success(entity);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
    }
  };

  return {
    onCreateEntity,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

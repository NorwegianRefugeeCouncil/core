import { PrmClient } from '@nrcno/core-clients';
import { Entity, EntityType } from '@nrcno/core-models';

import { SubmitStatus, useApiReducer } from './useApiReducer.hook';

export type EditEntityState = {
  onEditEntity: (entityId: string, entityDefinition: any) => Promise<any>;
  status: SubmitStatus;
  data?: Entity;
  error?: Error;
};

export const defaultEditEntityState: EditEntityState = {
  onEditEntity: async () => Promise.resolve(),
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

export const useEditEntity = (
  client: PrmClient[EntityType] | undefined,
): EditEntityState => {
  const [state, actions] = useApiReducer<Entity>();

  const onEditEntity = async (entityId: string, entityDefinition: any) => {
    if (!client) {
      throw new Error('Client is not defined');
    }
    try {
      actions.submitting();
      const entity = await client.update(entityId, entityDefinition);
      actions.success(entity);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
    }
  };

  return {
    onEditEntity,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

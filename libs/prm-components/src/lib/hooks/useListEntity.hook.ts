import { PrmClient } from '@nrcno/core-clients';
import {
  EntityType,
  Pagination,
  PaginatedResponse,
  EntityListItem,
} from '@nrcno/core-models';

import { SubmitStatus, useApiReducer } from './useApiReducer.hook';

export type ListEntityState = {
  listEntities: (pagination: Pagination) => Promise<void>;
  reset: () => void;
  status: SubmitStatus;
  data?: PaginatedResponse<EntityListItem>;
  error?: Error;
};

export const defaultListEntityState: ListEntityState = {
  listEntities: async (pagination: Pagination) => Promise.resolve(),
  reset: () => {
    return;
  },
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

export const useListEntity = (
  client: PrmClient[EntityType] | undefined,
): ListEntityState => {
  const [state, actions] = useApiReducer<PaginatedResponse<EntityListItem>>();

  const listEntities = async (pagination: Pagination) => {
    if (!client) {
      throw new Error('Client is not defined');
    }
    try {
      actions.submitting();
      const paginatedEntityList = await client.list(pagination);
      actions.success(paginatedEntityList);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
    }
  };

  return {
    listEntities,
    reset: actions.reset,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

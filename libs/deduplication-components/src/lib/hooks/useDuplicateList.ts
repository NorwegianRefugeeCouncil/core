import { DeduplicationClient } from '@nrcno/core-clients';
import {
  DenormalisedDeduplicationRecord,
  PaginatedResponse,
  Pagination,
} from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-prm-components';

export type DuplicateListState = {
  getDuplicateList: (pagination: Pagination) => Promise<void>;
  status: SubmitStatus;
  data?: PaginatedResponse<DenormalisedDeduplicationRecord>;
  error?: Error;
};

export const defaultDuplicateListState: DuplicateListState = {
  getDuplicateList: async () => Promise.resolve(),
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

export const useDuplicateList = (
  client: DeduplicationClient,
): DuplicateListState => {
  const [state, actions] =
    useApiReducer<PaginatedResponse<DenormalisedDeduplicationRecord>>();

  const getDuplicateList = async (pagination: Pagination) => {
    if (!client) {
      throw new Error('Client is not defined');
    }
    try {
      actions.submitting();
      const duplicates = await client.list(pagination);
      actions.success(duplicates);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      console.error(err);
      actions.error(err);
    }
  };

  return {
    getDuplicateList,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

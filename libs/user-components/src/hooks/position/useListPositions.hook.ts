import { PositionClient } from '@nrcno/core-clients';
import { PaginatedResponse, Pagination, Position } from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-prm-components';

export type PositionListState = {
  getPositionList: (pagination: Pagination) => Promise<void>;
  status: SubmitStatus;
  data?: PaginatedResponse<Position>;
  error?: Error;
};

export const defaultPositionListState: PositionListState = {
  getPositionList: async () => Promise.resolve(),
  status: SubmitStatus.IDLE,
};

export const useListPositions = (client: PositionClient): PositionListState => {
  const [state, actions] = useApiReducer<PaginatedResponse<Position>>();

  const getPositionList = async (pagination: Pagination) => {
    try {
      actions.submitting();
      const response = await client.list(pagination);
      actions.success(response);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
    }
  };

  return {
    getPositionList,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

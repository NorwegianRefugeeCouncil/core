import { UserClient } from '@nrcno/core-clients';
import {
  PaginatedResponse,
  Pagination,
  UserListItem,
} from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-prm-components';

export type UserListState = {
  getUserList: (pagination: Pagination) => Promise<void>;
  status: SubmitStatus;
  data?: PaginatedResponse<UserListItem>;
  error?: Error;
};

export const defaultUserListState: UserListState = {
  getUserList: async () => Promise.resolve(),
  status: SubmitStatus.IDLE,
};

export const useUserList = (client: UserClient): UserListState => {
  const [state, actions] = useApiReducer<PaginatedResponse<UserListItem>>();

  const getUserList = async (pagination: Pagination) => {
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
    getUserList,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

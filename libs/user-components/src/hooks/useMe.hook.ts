import { UserClient } from '@nrcno/core-clients';
import { User } from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-prm-components';

export type MeState = {
  getMe: () => Promise<any>;
  status: SubmitStatus;
  data?: any;
  error?: Error;
};

export const defaultMeState: MeState = {
  getMe: async () => Promise.resolve(),
  status: SubmitStatus.IDLE,
};

export const useMe = (client: UserClient): MeState => {
  const [state, actions] = useApiReducer<User>();

  const getMe = async () => {
    try {
      actions.submitting();
      const me = await client.getMe();
      actions.success(me);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
    }
  };

  return {
    getMe,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

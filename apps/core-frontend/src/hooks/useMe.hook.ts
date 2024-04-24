import * as React from 'react';

import { UserClient } from '@nrcno/core-clients';
import { User } from '@nrcno/core-models';

enum SubmitStatus {
  IDLE = 'idle',
  SUBMITTING = 'submitting',
  SUCCESS = 'success',
  ERROR = 'error',
}

type State = {
  status: SubmitStatus;
  data?: User;
  error?: Error;
};

type Action =
  | {
      type: SubmitStatus.IDLE;
    }
  | {
      type: SubmitStatus.SUBMITTING;
    }
  | {
      type: SubmitStatus.SUCCESS;
      data: User;
    }
  | {
      type: SubmitStatus.ERROR;
      data: Error;
    };

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
  const [state, dispatch] = React.useReducer(
    (state: State, action: Action) => {
      switch (action.type) {
        case SubmitStatus.SUBMITTING:
          return { ...state, status: SubmitStatus.SUBMITTING };
        case SubmitStatus.SUCCESS:
          return {
            ...state,
            status: SubmitStatus.SUCCESS,
            data: action.data,
          };
        case SubmitStatus.ERROR:
          return {
            ...state,
            status: SubmitStatus.ERROR,
            error: action.data,
          };
        case SubmitStatus.IDLE:
          return { ...state, status: SubmitStatus.IDLE };
        default:
          return state;
      }
    },
    {
      status: SubmitStatus.IDLE,
    },
  );

  const getMe = async () => {
    try {
      dispatch({ type: SubmitStatus.SUBMITTING });
      const me = await client.getMe();
      dispatch({ type: SubmitStatus.SUCCESS, data: me });
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      dispatch({ type: SubmitStatus.ERROR, data: err });
    }
  };

  return {
    getMe,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

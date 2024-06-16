// This file shouldn't live within this lib, but it is the best place for now
import * as React from 'react';

export enum SubmitStatus {
  IDLE = 'idle',
  SUBMITTING = 'submitting',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type State<T> = {
  status: SubmitStatus;
  data?: T;
  error?: Error;
};

export type Action<T> =
  | {
      type: SubmitStatus.IDLE;
    }
  | {
      type: SubmitStatus.SUBMITTING;
    }
  | {
      type: SubmitStatus.SUCCESS;
      data: T;
    }
  | {
      type: SubmitStatus.ERROR;
      data: Error;
    }
  | {
      type: 'reset';
    };

const defaultState = {
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

export const useApiReducer = <T>() => {
  const [state, dispatch] = React.useReducer(
    (state: State<T>, action: Action<T>) => {
      switch (action.type) {
        case SubmitStatus.IDLE:
          return { ...state, status: SubmitStatus.IDLE };
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
        case 'reset':
          return defaultState;
        default:
          return state;
      }
    },
    defaultState,
  );

  const actions = {
    idle: () => dispatch({ type: SubmitStatus.IDLE }),
    submitting: () => dispatch({ type: SubmitStatus.SUBMITTING }),
    success: (data: T) => dispatch({ type: SubmitStatus.SUCCESS, data }),
    error: (error: Error) =>
      dispatch({ type: SubmitStatus.ERROR, data: error }),
    reset: () => dispatch({ type: 'reset' }),
  };

  return [state, actions] as const;
};

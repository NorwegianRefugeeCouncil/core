import * as React from 'react';
import { PrmClient } from '@nrcno/core-clients';
import { EntityType } from '@nrcno/core-models';

import { SubmitStatus, State, Action } from '../types';

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
  const [state, dispatch] = React.useReducer(
    (state: State<Data>, action: Action<Data>) => {
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

  const loadEntity = async (entityId: string) => {
    if (!client) {
      throw new Error('Client is not defined');
    }
    try {
      dispatch({ type: SubmitStatus.SUBMITTING });
      const entity = await client.read(entityId);
      dispatch({ type: SubmitStatus.SUCCESS, data: entity });
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      dispatch({ type: SubmitStatus.ERROR, data: err });
    }
  };

  return {
    loadEntity,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

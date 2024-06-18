import { PositionClient } from '@nrcno/core-clients';
import { Position } from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-shared-frontend';

export type ReadPositionState = {
  loadPosition: (positionId: string) => Promise<void>;
  reset: () => void;
  status: SubmitStatus;
  data?: Position;
  error?: Error;
};

export const defaultReadPositionState: ReadPositionState = {
  loadPosition: async (positionId: string) => Promise.resolve(),
  reset: () => {
    return;
  },
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

export const useReadPosition = (client: PositionClient): ReadPositionState => {
  const [state, actions] = useApiReducer<Position>();

  const loadPosition = async (positionId: string) => {
    try {
      actions.submitting();
      const position = await client.read(positionId);
      actions.success(position);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
    }
  };

  return {
    loadPosition,
    reset: actions.reset,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

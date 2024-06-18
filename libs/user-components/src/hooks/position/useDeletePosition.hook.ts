import { PositionClient } from '@nrcno/core-clients';
import { Position } from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-shared-frontend';

export type DeletePositionState = {
  onDeletePosition: (positionId: string) => Promise<void>;
  reset: () => void;
  status: SubmitStatus;
  error?: Error;
};

export const defaultDeletePositionState: DeletePositionState = {
  onDeletePosition: async () => Promise.reject(),
  reset: () => {
    return;
  },
  status: SubmitStatus.IDLE,
  error: undefined,
};

export const useDeletePosition = (
  client: PositionClient,
): DeletePositionState => {
  const [state, actions] = useApiReducer<Position>();

  const onDeletePosition = async (positionId: string): Promise<void> => {
    try {
      actions.submitting();
      const position = await client.del(positionId);
      actions.success(position);
      return position;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
      throw err;
    }
  };

  return {
    onDeletePosition,
    reset: actions.reset,
    status: state.status,
    error: state.error,
  };
};

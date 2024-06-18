import { PositionClient } from '@nrcno/core-clients';
import { Position } from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-shared-frontend';

export type UpdatePositionState = {
  onUpdatePosition: (
    positionId: string,
    partialPosition: any,
  ) => Promise<Position>;
  reset: () => void;
  status: SubmitStatus;
  data?: Position;
  error?: Error;
};

export const defaultUpdatePositionState: UpdatePositionState = {
  onUpdatePosition: async () => Promise.reject(),
  reset: () => {
    return;
  },
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

export const useUpdatePosition = (
  client: PositionClient,
): UpdatePositionState => {
  const [state, actions] = useApiReducer<Position>();

  const onUpdatePosition = async (
    positionId: string,
    partialPosition: any,
  ): Promise<Position> => {
    try {
      actions.submitting();
      const position = await client.update(positionId, partialPosition);
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
    onUpdatePosition,
    reset: actions.reset,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

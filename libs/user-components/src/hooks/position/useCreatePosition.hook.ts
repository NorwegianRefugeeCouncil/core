import { PositionClient } from '@nrcno/core-clients';
import { Position, PositionDefinition } from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-shared-frontend';

export type CreatePositionState = {
  onCreatePosition: (
    positionDefinition: PositionDefinition,
  ) => Promise<Position>;
  reset: () => void;
  status: SubmitStatus;
  data?: Position;
  error?: Error;
};

export const defaultCreatePositionState: CreatePositionState = {
  onCreatePosition: async () => Promise.reject(),
  reset: () => {
    return;
  },
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

export const useCreatePosition = (
  client: PositionClient,
): CreatePositionState => {
  const [state, actions] = useApiReducer<Position>();

  const onCreatePosition = async (
    positionDefinition: PositionDefinition,
  ): Promise<Position> => {
    try {
      actions.submitting();
      const position = await client.create(positionDefinition);
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
    onCreatePosition,
    reset: actions.reset,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

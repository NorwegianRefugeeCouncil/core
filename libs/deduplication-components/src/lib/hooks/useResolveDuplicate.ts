import { DeduplicationClient } from '@nrcno/core-clients';
import { Participant } from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-prm-components';

export type ResolveDuplicateState = {
  merge: (
    participantIdA: string,
    participantIdB: string,
    resolvedParticipant: Participant,
  ) => Promise<void>;
  ignore: (participantIdA: string, participantIdB: string) => Promise<void>;
  status: SubmitStatus;
  data?: Participant;
  error?: Error;
};

export const defaultResolveDuplicateState: ResolveDuplicateState = {
  merge: async () => Promise.resolve(),
  ignore: async () => Promise.resolve(),
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

export const useResolveDuplicate = (
  client: DeduplicationClient,
): ResolveDuplicateState => {
  const [state, actions] = useApiReducer<Participant | undefined>();

  const merge = async (
    participantIdA: string,
    participantIdB: string,
    resolvedParticipant: Participant,
  ) => {
    try {
      actions.submitting();
      const participant = await client.merge(
        participantIdA,
        participantIdB,
        resolvedParticipant,
      );
      actions.success(participant);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
    }
  };

  const ignore = async (participantIdA: string, participantIdB: string) => {
    try {
      actions.submitting();
      await client.ignore(participantIdA, participantIdB);
      actions.success(undefined);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
    }
  };

  return {
    merge,
    ignore,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

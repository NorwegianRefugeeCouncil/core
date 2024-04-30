import { DeduplicationClient } from '@nrcno/core-clients';
import { DeduplicationRecord, Participant } from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-prm-components';

export type CheckDuplicatesState = {
  check: (participant: Partial<Participant>) => Promise<void>;
  status: SubmitStatus;
  data?: DeduplicationRecord[];
  error?: Error;
};

export const defaultCheckDuplicatesState: CheckDuplicatesState = {
  check: async () => Promise.resolve(),
  status: SubmitStatus.IDLE,
  data: undefined,
  error: undefined,
};

export const useCheckDuplicates = (
  client: DeduplicationClient,
): CheckDuplicatesState => {
  const [state, actions] = useApiReducer<DeduplicationRecord[]>();

  const check = async (participant: Partial<Participant>) => {
    try {
      actions.submitting();
      const duplicates = await client.check(participant);
      actions.success(duplicates);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
    }
  };

  return {
    check,
    status: state.status,
    data: state.data,
    error: state.error,
  };
};

import { DeduplicationClient } from '@nrcno/core-clients';
import { DeduplicationRecord, Individual } from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-prm-components';

export type CheckDuplicatesState = {
  check: (individual: Partial<Individual>) => Promise<void>;
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

  const check = async (individual: Partial<Individual>) => {
    try {
      actions.submitting();
      const duplicates = await client.check(individual);
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

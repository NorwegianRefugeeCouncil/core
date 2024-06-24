import { DeduplicationClient } from '@nrcno/core-clients';
import { Individual } from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-prm-components';

export type ResolveDuplicateState = {
  merge: (
    individualIdA: string,
    individualIdB: string,
    resolvedIndividual: Individual,
  ) => Promise<void>;
  ignore: (individualIdA: string, individualIdB: string) => Promise<void>;
  status: SubmitStatus;
  data?: Individual;
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
  const [state, actions] = useApiReducer<Individual | undefined>();

  const merge = async (
    individualIdA: string,
    individualIdB: string,
    resolvedIndividual: Individual,
  ) => {
    try {
      actions.submitting();
      const individual = await client.merge(
        individualIdA,
        individualIdB,
        resolvedIndividual,
      );
      actions.success(individual);
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      actions.error(err);
    }
  };

  const ignore = async (individualIdA: string, individualIdB: string) => {
    try {
      actions.submitting();
      await client.ignore(individualIdA, individualIdB);
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

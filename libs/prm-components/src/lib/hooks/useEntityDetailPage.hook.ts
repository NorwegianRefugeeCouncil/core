import { useLoaderData } from 'react-router-dom';

import { CreateEntityLoaderData } from '../pages';
import { usePrmContext } from '../prm.context';
import { config } from '../config';
import { SubmitStatus } from '../types';

export const useEntityDetailPage = () => {
  const { mode, entityType } = useLoaderData() as CreateEntityLoaderData;

  const prmContext = usePrmContext();

  const detailConfig = config[entityType].detail;

  switch (mode) {
    case 'create': {
      return {
        entityType,
        config: detailConfig,
        isLoading: prmContext.create.status === SubmitStatus.SUBMITTING,
        isError: prmContext.create.status === SubmitStatus.ERROR,
        isSuccess: prmContext.create.status === SubmitStatus.SUCCESS,
        error: prmContext.create.error,
      };
    }
    default:
      throw new Error('Invalid mode');
  }
};

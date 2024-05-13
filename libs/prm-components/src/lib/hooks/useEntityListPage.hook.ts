import { useEffect } from 'react';
import { Pagination } from '@nrcno/core-models';

import { usePrmContext } from '../prm.context';
import { config } from '../config';

import { SubmitStatus } from './useApiReducer.hook';

export const useEntityListPage = (pagination: Pagination) => {
  const { entityType, list } = usePrmContext();

  useEffect(() => {
    list.listEntities(pagination);
  }, [JSON.stringify(pagination)]);

  if (!entityType) {
    throw new Error('Entity type is required');
  }

  const listConfig = config[entityType].list;

  return {
    entityType: entityType,
    config: listConfig,
    isLoading: list.status === SubmitStatus.SUBMITTING,
    isError: list.status === SubmitStatus.ERROR,
    isSuccess: list.status === SubmitStatus.SUCCESS,
    error: list.error,
    data: list.data,
  };
};

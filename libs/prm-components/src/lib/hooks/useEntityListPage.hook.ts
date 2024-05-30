import { useEffect } from 'react';
import { Pagination } from '@nrcno/core-models';

import { usePrmContext } from '../prm.context';

import { SubmitStatus } from './useApiReducer.hook';

export const useEntityListPage = (pagination: Pagination) => {
  const { entityType, list, config } = usePrmContext();

  useEffect(() => {
    list.listEntities(pagination);
  }, [JSON.stringify(pagination)]);

  if (!entityType) {
    throw new Error('Entity type is required');
  }

  if (!config?.[entityType]) {
    throw new Error('Entity type not found in config');
  }

  const listConfig = config[entityType].list;
  const searchConfig = config[entityType].search;

  return {
    entityType: entityType,
    listConfig,
    searchConfig,
    isLoading: list.status === SubmitStatus.SUBMITTING,
    isError: list.status === SubmitStatus.ERROR,
    isSuccess: list.status === SubmitStatus.SUCCESS,
    error: list.error,
    data: list.data,
  };
};

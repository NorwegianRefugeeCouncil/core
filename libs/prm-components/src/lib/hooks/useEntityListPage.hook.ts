import { EntityFiltering, Pagination } from '@nrcno/core-models';
import { useEffect } from 'react';

import { usePrmContext } from '../prm.context';

import { SubmitStatus } from './useApiReducer.hook';

export const useEntityListPage = (
  pagination: Pagination,
  filters: EntityFiltering,
) => {
  const { entityType, list, config } = usePrmContext();

  useEffect(() => {
    console.log('uselistpagehook', filters);
    list.listEntities(pagination, filters);
  }, [JSON.stringify(pagination), JSON.stringify(filters)]);

  if (!entityType) {
    throw new Error('Entity type is required');
  }

  if (!config?.[entityType]) {
    throw new Error('Entity type not found in config');
  }

  const listConfig = config[entityType].list;
  const filterConfig = config[entityType].filtering;

  return {
    entityType: entityType,
    listConfig,
    filterConfig,
    isLoading: list.status === SubmitStatus.SUBMITTING,
    isError: list.status === SubmitStatus.ERROR,
    isSuccess: list.status === SubmitStatus.SUCCESS,
    error: list.error,
    data: list.data,
  };
};

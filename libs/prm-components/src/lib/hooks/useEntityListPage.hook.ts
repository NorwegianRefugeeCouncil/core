import { EntityFiltering, Pagination, Sorting } from '@nrcno/core-models';
import { useEffect } from 'react';

import { usePrmContext } from '../prm.context';

import { SubmitStatus } from './useApiReducer.hook';

export const useEntityListPage = (
  pagination: Pagination,
  sorting: Sorting,
  filters: EntityFiltering | null,
) => {
  const { entityType, list, config } = usePrmContext();

  useEffect(() => {
    if (filters != null) {
      list.listEntities(pagination, sorting, filters);
    }
  }, [
    JSON.stringify(pagination),
    JSON.stringify(sorting),
    JSON.stringify(filters),
  ]);

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

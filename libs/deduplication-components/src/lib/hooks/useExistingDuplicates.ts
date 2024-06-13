import * as React from 'react';
import { z } from 'zod';

import { SubmitStatus } from '@nrcno/core-prm-components';
import { Pagination } from '@nrcno/core-models';

import { useDeduplicationContext } from '../deduplication.context';

export const useExistingDuplicates = (pagination: Pagination) => {
  const { list, resolve } = useDeduplicationContext();

  const load = () => {
    list.getDuplicateList(pagination);
  };

  React.useEffect(() => {
    load();
  }, [JSON.stringify(pagination)]);

  return {
    data: list.data,
    isLoading: list.status === SubmitStatus.SUBMITTING,
    isError: list.status === SubmitStatus.ERROR,
    isSuccess: list.status === SubmitStatus.SUCCESS,
    error: list.error,
    refresh: load,
  };
};

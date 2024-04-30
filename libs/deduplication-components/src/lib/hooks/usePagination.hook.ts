import * as React from 'react';

import { Pagination } from '@nrcno/core-models';

export const usePagination = () => {
  const [pagination, setPagination] = React.useState<Pagination>({
    startIndex: 0,
    limit: 100,
  });

  const setStartIndex = (startIndex: number) =>
    setPagination((prev) => ({ ...prev, startIndex }));

  const setLimit = (limit: number) =>
    setPagination((prev) => ({ ...prev, limit }));

  const nextPage = () =>
    setPagination((prev) => ({
      ...prev,
      startIndex: prev.startIndex + prev.limit,
    }));

  const previousPage = () =>
    setPagination((prev) => ({
      ...prev,
      startIndex: prev.startIndex - prev.limit,
    }));

  return {
    pagination,
    setStartIndex,
    setLimit,
    nextPage,
    previousPage,
  };
};

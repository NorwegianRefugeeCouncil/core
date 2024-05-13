import { useState } from 'react';
import { PaginatedResponse, Pagination } from '@nrcno/core-models';

export interface UsePagination {
  pagination: Pagination;
  totalCount: number;
  totalPages: number;
  setStartIndex: (startIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  updateFromPaginationResponse: (
    paginationResponse: PaginatedResponse<any>,
  ) => void;
  nextPage: () => void;
  prevPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  setTotalCount: (totalCount: number) => void;
}

export const usePagination = (): UsePagination => {
  const [startIndex, setStartIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(50);
  const [totalCount, setTotalCount] = useState<number>(0);

  const nextPage = () => {
    setStartIndex(startIndex + pageSize);
  };

  const prevPage = () => {
    setStartIndex(startIndex - pageSize);
  };

  const isFirstPage = startIndex === 0;
  const isLastPage = pageSize + startIndex >= totalCount;

  const totalPages = Math.ceil(totalCount / pageSize);

  const updateFromPaginationResponse = (
    paginationResponse: PaginatedResponse<any>,
  ) => {
    setStartIndex(paginationResponse.startIndex);
    setPageSize(paginationResponse.pageSize);
    setTotalCount(paginationResponse.totalCount);
  };

  return {
    pagination: {
      startIndex,
      pageSize,
    },
    totalCount,
    totalPages,
    setStartIndex,
    setPageSize,
    updateFromPaginationResponse,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage,
    setTotalCount,
  };
};

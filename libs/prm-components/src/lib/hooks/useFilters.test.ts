import { renderHook, act } from '@testing-library/react-hooks';

import { useFilters } from './useFilters';

describe('useFilters', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFilters());

    expect(result.current.filters).toBe({});
    expect(result.current.pagination.pageSize).toBe(50);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.isFirstPage).toBe(true);
    expect(result.current.isLastPage).toBe(true);
  });

  it('should update pagination values', () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.setStartIndex(10);
      result.current.setPageSize(20);
      result.current.setTotalCount(100);
    });

    expect(result.current.pagination.startIndex).toBe(10);
    expect(result.current.pagination.pageSize).toBe(20);
    expect(result.current.totalCount).toBe(100);
    expect(result.current.totalPages).toBe(5);
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(false);
  });

  it('should update pagination values from response', () => {
    const { result } = renderHook(() => useFilters());

    const paginationResponse = {
      startIndex: 20,
      pageSize: 10,
      totalCount: 100,
      items: [],
    };

    act(() => {
      result.current.updateFromPaginationResponse(paginationResponse);
    });

    expect(result.current.pagination.startIndex).toBe(20);
    expect(result.current.pagination.pageSize).toBe(10);
    expect(result.current.totalCount).toBe(100);
    expect(result.current.totalPages).toBe(10);
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(false);
  });

  it('should navigate to next and previous pages', () => {
    const { result } = renderHook(() => useFilters());

    act(() => {
      result.current.setStartIndex(10);
      result.current.setPageSize(20);
      result.current.setTotalCount(100);
    });

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.pagination.startIndex).toBe(30);
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(false);

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.pagination.startIndex).toBe(10);
    expect(result.current.isFirstPage).toBe(false);
    expect(result.current.isLastPage).toBe(false);
  });
});

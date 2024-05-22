import { render, fireEvent } from '@testing-library/react';

import { UsePagination } from '../hooks/usePagination';

import { Pagination } from './Pagination.component';

const mockPagination: UsePagination['pagination'] = {
  startIndex: 0,
  pageSize: 20,
};

const mockSetPageSize: UsePagination['setPageSize'] = vi.fn();
const mockNextPage: UsePagination['nextPage'] = vi.fn();
const mockPrevPage: UsePagination['prevPage'] = vi.fn();
const mockIsFirstPage = false;
const mockIsLastPage = false;
const mockTotalCount = 100;
const mockTotalPages = 5;

describe('Pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the correct page information', () => {
    const { getByText } = render(
      <Pagination
        pagination={mockPagination}
        setPageSize={mockSetPageSize}
        nextPage={mockNextPage}
        prevPage={mockPrevPage}
        isFirstPage={mockIsFirstPage}
        isLastPage={mockIsLastPage}
        totalCount={mockTotalCount}
        totalPages={mockTotalPages}
      />,
    );

    expect(getByText('Page 0 / 5')).toBeTruthy();
    expect(getByText('100 total')).toBeTruthy();
  });

  test('renders the correct page sizes', () => {
    const { getByText } = render(
      <Pagination
        pagination={mockPagination}
        setPageSize={mockSetPageSize}
        nextPage={mockNextPage}
        prevPage={mockPrevPage}
        isFirstPage={mockIsFirstPage}
        isLastPage={mockIsLastPage}
        totalCount={mockTotalCount}
        totalPages={mockTotalPages}
      />,
    );

    expect(getByText('20')).toBeTruthy();
    expect(getByText('50')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
  });

  test('calls setPageSize when a page size button is clicked', () => {
    const { getByText } = render(
      <Pagination
        pagination={mockPagination}
        setPageSize={mockSetPageSize}
        nextPage={mockNextPage}
        prevPage={mockPrevPage}
        isFirstPage={mockIsFirstPage}
        isLastPage={mockIsLastPage}
        totalCount={mockTotalCount}
        totalPages={mockTotalPages}
      />,
    );

    fireEvent.click(getByText('50'));
    expect(mockSetPageSize).toHaveBeenCalledWith(50);
  });

  test('calls nextPage when the Next button is clicked', () => {
    const { getByText } = render(
      <Pagination
        pagination={mockPagination}
        setPageSize={mockSetPageSize}
        nextPage={mockNextPage}
        prevPage={mockPrevPage}
        isFirstPage={mockIsFirstPage}
        isLastPage={mockIsLastPage}
        totalCount={mockTotalCount}
        totalPages={mockTotalPages}
      />,
    );

    fireEvent.click(getByText('Next'));
    expect(mockNextPage).toHaveBeenCalled();
  });

  test('calls prevPage when the Previous button is clicked', () => {
    const { getByText } = render(
      <Pagination
        pagination={mockPagination}
        setPageSize={mockSetPageSize}
        nextPage={mockNextPage}
        prevPage={mockPrevPage}
        isFirstPage={mockIsFirstPage}
        isLastPage={mockIsLastPage}
        totalCount={mockTotalCount}
        totalPages={mockTotalPages}
      />,
    );

    fireEvent.click(getByText('Previous'));
    expect(mockPrevPage).toHaveBeenCalled();
  });

  test('disables the Previous button when isFirstPage is true', () => {
    const { getByText } = render(
      <Pagination
        pagination={mockPagination}
        setPageSize={mockSetPageSize}
        nextPage={mockNextPage}
        prevPage={mockPrevPage}
        isFirstPage={true}
        isLastPage={mockIsLastPage}
        totalCount={mockTotalCount}
        totalPages={mockTotalPages}
      />,
    );

    const previousButton = getByText('Previous');
    expect(previousButton.getAttribute('disabled')).toEqual('');
    fireEvent.click(previousButton);
    expect(mockPrevPage).not.toHaveBeenCalled();
  });

  test('disables the Next button when isLastPage is true', () => {
    const { getByText } = render(
      <Pagination
        pagination={mockPagination}
        setPageSize={mockSetPageSize}
        nextPage={mockNextPage}
        prevPage={mockPrevPage}
        isFirstPage={mockIsFirstPage}
        isLastPage={true}
        totalCount={mockTotalCount}
        totalPages={mockTotalPages}
      />,
    );

    const nextButton = getByText('Next');
    expect(nextButton.getAttribute('disabled')).toEqual('');
    fireEvent.click(nextButton);
    expect(mockNextPage).not.toHaveBeenCalled();
  });
});

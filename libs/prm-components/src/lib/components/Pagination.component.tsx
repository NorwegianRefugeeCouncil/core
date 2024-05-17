import { ButtonGroup, Button, Flex, Text } from '@chakra-ui/react';

import { UsePagination } from '../hooks/usePagination';

type Props = {
  pagination: UsePagination['pagination'];
  setPageSize: UsePagination['setPageSize'];
  nextPage: UsePagination['nextPage'];
  prevPage: UsePagination['prevPage'];
  isFirstPage: boolean;
  isLastPage: UsePagination['isLastPage'];
  totalCount: UsePagination['totalCount'];
  totalPages: UsePagination['totalPages'];
};

const pageSizes = [20, 50, 100];

export const Pagination: React.FC<Props> = ({
  pagination,
  setPageSize,
  nextPage,
  prevPage,
  isFirstPage,
  isLastPage,
  totalCount,
  totalPages,
}) => {
  const currentPage =
    Math.floor(pagination.startIndex / pagination.pageSize) + 1;
  return (
    <Flex direction="column" gap={2}>
      <Flex gap={2} justifyContent="flex-end">
        <Text>
          Page {currentPage} / {totalPages}
        </Text>
        <Text>|</Text>
        <Text>{totalCount} total</Text>
      </Flex>
      <Flex gap={4}>
        <ButtonGroup isAttached>
          {pageSizes.map((size) => (
            <Button
              key={size}
              onClick={() => setPageSize(size)}
              isActive={size === pagination.pageSize}
            >
              {size}
            </Button>
          ))}
        </ButtonGroup>
        <ButtonGroup isAttached>
          <Button onClick={prevPage} isDisabled={isFirstPage}>
            Previous
          </Button>
          <Button onClick={nextPage} isDisabled={isLastPage}>
            Next
          </Button>
        </ButtonGroup>
      </Flex>
    </Flex>
  );
};

import { useEffect } from 'react';
import {
  Heading,
  Flex,
  Skeleton,
  Alert,
  AlertIcon,
  Button,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import {
  DisplacementStatus,
  IdentificationType,
  Sex,
} from '@nrcno/core-models';

import { EntityList } from '../../components';
import { useEntityListPage } from '../../hooks/useEntityListPage.hook';
import { usePagination } from '../../hooks/usePagination';
import { Pagination } from '../../components/Pagination.component';

export const EntityListPage: React.FC = () => {
  const {
    pagination,
    setPageSize,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage,
    totalCount,
    totalPages,
    updateFromPaginationResponse,
  } = usePagination();

  const { entityType, config, isError, isLoading, error, data } =
    useEntityListPage(pagination);

  useEffect(() => {
    if (data) updateFromPaginationResponse(data);
  }, [JSON.stringify(data)]);

  return (
    <Flex height="100%" direction="column">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading pb="8">{entityType}</Heading>
        <Link to="new">
          <Button colorScheme="primary">New</Button>
        </Link>
      </Flex>
      {isError ? (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error?.message}
        </Alert>
      ) : data?.totalCount === 0 ? (
        <Alert status="info" mb={4}>
          <AlertIcon />
          No {entityType} found
        </Alert>
      ) : (
        <>
          <Flex flex={1} overflow="hidden">
            <Skeleton isLoaded={!isLoading}>
              <EntityList config={config} entityList={data?.items} />
            </Skeleton>
          </Flex>
          <Flex justifyContent="flex-end">
            <Pagination
              pagination={pagination}
              setPageSize={setPageSize}
              nextPage={nextPage}
              prevPage={prevPage}
              isFirstPage={isFirstPage}
              isLastPage={isLastPage}
              totalCount={totalCount}
              totalPages={totalPages}
            />
          </Flex>
        </>
      )}
    </Flex>
  );
};

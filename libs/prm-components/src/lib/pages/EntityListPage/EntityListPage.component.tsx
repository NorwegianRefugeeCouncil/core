import { SearchIcon, SmallAddIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  CloseButton,
  Flex,
  Heading,
  Skeleton,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  createSortingSchema,
  getEntityListSortingFields,
  Sorting,
} from '@nrcno/core-models';

import { EntityList } from '../../components';
import { FilterDrawer } from '../../components/FilterDrawer.component';
import { FilterTags } from '../../components/FilterTags.component';
import { Pagination } from '../../components/Pagination.component';
import { useEntityListPage } from '../../hooks/useEntityListPage.hook';
import { useFilters } from '../../hooks/useFilters';
import { usePagination } from '../../hooks/usePagination';
import { useSorting } from '../../hooks/useSorting.hook';
import { SortingControl } from '../../components/Sorting.component';
import { usePrmContext } from '../../prm.context';

export const EntityListPage: React.FC = () => {
  const { entityType } = usePrmContext();

  const [searchParams, setSearchParams] = useSearchParams();

  const {
    pagination,
    setPageSize,
    setStartIndex,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage,
    totalCount,
    totalPages,
    updateFromPaginationResponse,
  } = usePagination();

  const { applyFilters, clearFilters, deleteFilter, filters } = useFilters();

  const { sorting, updateSorting } = useSorting(
    entityType ? createSortingSchema(entityType).parse({}) : null,
  );

  const { listConfig, filterConfig, isError, isLoading, error, data } =
    useEntityListPage(pagination, sorting, filters);

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (data) updateFromPaginationResponse(data);
  }, [JSON.stringify(data)]);

  const handleAlertCloseButtonClick = () => {
    searchParams.delete('success');
    setSearchParams(searchParams);
  };

  const handleSortingChange = (sorting: Sorting) => {
    updateSorting(sorting);
    setStartIndex(0);
  };

  if (!entityType) {
    throw new Error('Entity type is required');
  }

  return (
    <Flex height="100%" direction="column">
      <Flex justifyContent="space-between" alignItems="flex-start" pb="6">
        <Flex direction="column">
          <Heading>{entityType}</Heading>
          <Box h="1rem">
            <Skeleton isLoaded={!isLoading}>
              <Text>{totalCount} results</Text>
            </Skeleton>
          </Box>
        </Flex>
        <Box>
          <Link to="new">
            <Button colorScheme="primary">
              <SmallAddIcon me={2} />
              New
            </Button>
          </Link>
          <Button
            colorScheme="primary"
            variant="outline"
            onClick={onOpen}
            ms="2"
          >
            <SearchIcon me={2} />
            Search
          </Button>
        </Box>
      </Flex>
      {searchParams.get('success') && (
        <Alert status="success" mb={4}>
          <Flex
            w="100%"
            direction="row"
            alignItems="center"
            justify="space-between"
          >
            <Flex>
              <AlertIcon />
              {entityType}: {searchParams.get('success')}
            </Flex>
            <CloseButton onClick={handleAlertCloseButtonClick} />
          </Flex>
        </Alert>
      )}
      <Flex mb={4} direction="row" gap={8}>
        <Flex flex={1}>
          <FilterTags filters={filters} deleteFilter={deleteFilter} />
        </Flex>
        <SortingControl
          fields={getEntityListSortingFields(entityType)}
          sorting={sorting}
          onChange={handleSortingChange}
        />
      </Flex>
      {isError ? (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error?.message}
        </Alert>
      ) : (
        <>
          <Flex flex={1} overflow="hidden">
            <Skeleton isLoaded={!isLoading} w="100%">
              <EntityList config={listConfig} entityList={data?.items} />
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
      <FilterDrawer
        entityType={entityType}
        filterConfig={filterConfig}
        filters={filters}
        isOpen={isOpen}
        onClose={onClose}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
      />
    </Flex>
  );
};

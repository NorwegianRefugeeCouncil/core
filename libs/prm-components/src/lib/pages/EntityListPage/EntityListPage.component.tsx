import { SearchIcon, SmallAddIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertIcon,
  Box,
  CloseButton,
  Button,
  Flex,
  Heading,
  Skeleton,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { EntityList } from '../../components';
import { Pagination } from '../../components/Pagination.component';
import { useEntityListPage } from '../../hooks/useEntityListPage.hook';
import { useFilters } from '../../hooks/useFilters';
import { usePagination } from '../../hooks/usePagination';

import { FilterDrawer } from './FilterDrawer.component';
import { FilterTags } from './FilterTags.component';

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

  const { applyFilters, clearFilters, deleteFilter, filters } = useFilters();

  const {
    entityType,
    listConfig,
    filterConfig,
    isError,
    isLoading,
    error,
    data,
  } = useEntityListPage(pagination, filters);

  const [searchParams, setSearchParams] = useSearchParams();

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (data) updateFromPaginationResponse(data);
  }, [JSON.stringify(data)]);

  const handleAlertCloseButtonClick = () => {
    searchParams.delete('success');
    setSearchParams(searchParams);
  };

  return (
    <Flex height="100%" direction="column">
      <Box>
        <Flex justifyContent="space-between" alignItems="flex-start" pb="6">
          <Flex direction={'column'}>
            <Heading>{entityType}</Heading>
            <Text width={'16rem'}>{totalCount} results</Text>
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
          <Box>
            {searchParams.get('success') && (
              <Alert status="success" mb={4}>
                <Flex
                  w={'100%'}
                  direction={'row'}
                  alignItems={'center'}
                  justify={'space-between'}
                >
                  <Flex>
                    <AlertIcon />
                    {entityType}: {searchParams.get('success')}
                  </Flex>
                  <CloseButton onClick={handleAlertCloseButtonClick} />
                </Flex>
              </Alert>
            )}
          </Box>
        </Flex>
        <Flex mb={4}>
          <FilterTags filters={filters} deleteFilter={deleteFilter} />
        </Flex>
      </Box>
      {isError ? (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error?.message}
        </Alert>
      ) : (
        <>
          <Flex flex={1} overflow="hidden">
            <Skeleton isLoaded={!isLoading} width="100%">
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

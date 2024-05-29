import { useEffect } from 'react';
import {
  Heading,
  Flex,
  Skeleton,
  Alert,
  AlertIcon,
  Button,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Box,
  Text,
  CloseButton,
} from '@chakra-ui/react';
import { Link, useSearchParams } from 'react-router-dom';
import { SmallAddIcon, SearchIcon } from '@chakra-ui/icons';

import { EntityList, EntitySearchForm } from '../../components';
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

  const {
    entityType,
    listConfig,
    searchConfig,
    isError,
    isLoading,
    error,
    data,
  } = useEntityListPage(pagination);

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
      <Flex justifyContent="space-between" alignItems="center">
        <Heading pb="8">{entityType}</Heading>
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
      <Drawer placement="right" onClose={onClose} isOpen={isOpen} size={'md'}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Search</DrawerHeader>
          <DrawerBody>
            <EntitySearchForm
              id={`entity_search_${entityType}`}
              config={searchConfig}
              onCancel={onClose}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

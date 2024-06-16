import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Heading,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import {
  Pagination,
  SubmitStatus,
  usePagination,
} from '@nrcno/core-shared-frontend';

import { UserList } from '../components/UserList.component';
import { useUserContext } from '../user.context';

export const UserListPage: React.FC = () => {
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
    list: { getUserList, data, status, error },
  } = useUserContext();

  useEffect(() => {
    getUserList(pagination);
  }, [JSON.stringify(pagination)]);

  useEffect(() => {
    if (data) updateFromPaginationResponse(data);
  }, [JSON.stringify(data)]);

  const isLoading = status === SubmitStatus.SUBMITTING;
  const isError = status === SubmitStatus.ERROR;

  return (
    <Flex height="100%" direction="column">
      <Flex justifyContent="space-between" alignItems="flex-start" pb="6">
        <Flex direction="column">
          <Heading>Users</Heading>
          <Box h="1rem">
            <Skeleton isLoaded={!isLoading}>
              <Text>{totalCount} results</Text>
            </Skeleton>
          </Box>
        </Flex>
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
              <UserList users={data?.items ?? []} />
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

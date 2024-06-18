import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Heading,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Pagination,
  SubmitStatus,
  usePagination,
} from '@nrcno/core-shared-frontend';
import { SmallAddIcon } from '@chakra-ui/icons';
import { TeamListItem } from '@nrcno/core-models';

import { TeamList } from '../components/TeamList.component';
import { useUserContext } from '../user.context';

export const TeamListPage: React.FC = () => {
  const navigate = useNavigate();

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
    team: {
      list: { onList, data, status, error },
    },
  } = useUserContext();

  useEffect(() => {
    onList(pagination);
  }, [JSON.stringify(pagination)]);

  useEffect(() => {
    if (data) updateFromPaginationResponse(data);
  }, [JSON.stringify(data)]);

  const isLoading = status === SubmitStatus.SUBMITTING;
  const isError = status === SubmitStatus.ERROR;

  const handleRowClick = (team: TeamListItem) => {
    navigate(team.id);
  };

  return (
    <Flex height="100%" direction="column">
      <Flex justifyContent="space-between" alignItems="flex-start" pb="6">
        <Flex direction="column">
          <Heading>Teams</Heading>
          <Box h="1rem">
            <Skeleton isLoaded={!isLoading}>
              <Text>{totalCount} results</Text>
            </Skeleton>
          </Box>
        </Flex>
        <Link to="new">
          <Button colorScheme="primary">
            <SmallAddIcon me={2} />
            New
          </Button>
        </Link>
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
              <TeamList teams={data?.items ?? []} onRowClick={handleRowClick} />
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

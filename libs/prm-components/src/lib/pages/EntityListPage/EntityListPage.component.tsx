import { Heading, Spinner, Flex } from '@chakra-ui/react';
import {
  DisplacementStatus,
  IdentificationType,
  Sex,
} from '@nrcno/core-models';
import { useEffect } from 'react';

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

  const { entityType, config, isLoading, isError, isSuccess, error, data } =
    useEntityListPage(pagination);

  useEffect(() => {
    if (data) updateFromPaginationResponse(data);
  }, [JSON.stringify(data)]);

  return (
    <Flex height="100%" direction="column">
      <Heading pb="8">{entityType}</Heading>
      {isLoading && <Spinner colorScheme="primary" size="xl" />}
      {isError && <div>{error?.message}</div>}
      {isSuccess && <div>Success</div>}
      <Flex flex={1} overflow="hidden">
        <EntityList
          config={config}
          entityList={new Array(100).fill({
            dateOfBirth: new Date('2006-10-12'),
            displacementStatus: DisplacementStatus.AsylumSeeker,
            firstName: 'first name',
            id: 'id1',
            lastName: 'lastname',
            nationalities: ['en'],
            identification: [
              {
                id: 'id1',
                identificationType: IdentificationType.Passport,
                identificationNumber: '123456789',
                isPrimary: true,
              },
            ],
            contactDetails: {
              phones: [
                {
                  id: 'phone1',
                  value: '12345678',
                },
              ],
              emails: [
                {
                  id: 'email1',
                  value: 'email@email.com',
                },
              ],
            },
            sex: Sex.Female,
          })}
        />
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
    </Flex>
  );
};

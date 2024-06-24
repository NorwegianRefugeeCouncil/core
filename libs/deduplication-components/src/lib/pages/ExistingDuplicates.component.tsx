import { useEffect, useState } from 'react';
import {
  Heading,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Alert,
  AlertIcon,
  Flex,
  Skeleton,
} from '@chakra-ui/react';

import { DenormalisedDeduplicationRecord } from '@nrcno/core-models';
import { usePagination, Pagination } from '@nrcno/core-prm-components';

import { useExistingDuplicates } from '../hooks/useExistingDuplicates';
import { DuplicateDetail } from '../components/DuplicateDetail.component';
import { DuplicateListTable } from '../components/DuplicateListTable.component';

export const ExistingDuplicates: React.FC = () => {
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

  const [selectedDuplicate, setSelectedDuplicate] =
    useState<DenormalisedDeduplicationRecord | null>(null);

  const { data, isLoading, isError, isSuccess, error, refresh } =
    useExistingDuplicates(pagination);

  useEffect(() => {
    if (data) updateFromPaginationResponse(data);
  }, [JSON.stringify(data)]);

  const handleCloseModal = () => setSelectedDuplicate(null);

  return (
    <>
      <Flex height="100%" direction="column">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading pb="8">Existing duplicates</Heading>
        </Flex>
        {isError ? (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error?.message}
          </Alert>
        ) : data?.totalCount === 0 ? (
          <Alert status="info" mb={4}>
            <AlertIcon />
            No duplicates found
          </Alert>
        ) : (
          <>
            <Flex flex={1} overflow="hidden">
              <Skeleton isLoaded={!isLoading} width="100%">
                <DuplicateListTable
                  data={data?.items ?? []}
                  onRowClick={setSelectedDuplicate}
                />
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

      <Modal
        isOpen={Boolean(selectedDuplicate)}
        onClose={handleCloseModal}
        size="full"
      >
        <ModalOverlay />
        <ModalContent height="100%">
          <ModalHeader>
            Individual {selectedDuplicate?.individualA.id} | Individual{' '}
            {selectedDuplicate?.individualB.id} |{' '}
            {selectedDuplicate?.weightedScore}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflow="hidden">
            {selectedDuplicate && (
              <DuplicateDetail
                duplicate={selectedDuplicate}
                onSubmit={async () => {
                  await refresh();
                  handleCloseModal();
                }}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

import * as React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Box,
  Button,
  Heading,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
} from '@chakra-ui/react';

import { DenormalisedDeduplicationRecord } from '@nrcno/core-models';

import { useExistingDuplicates } from '../hooks/useExistingDuplicates';
import { usePagination } from '../hooks/usePagination.hook';
import { DuplicateDetail } from '../components/DuplicateDetail.component';

export const ExistingDuplicates: React.FC = () => {
  const [selectedDuplicate, setSelectedDuplicate] =
    React.useState<DenormalisedDeduplicationRecord | null>(null);

  const { pagination, nextPage, previousPage } = usePagination();

  const { data, isLoading, isError, isSuccess, error } =
    useExistingDuplicates(pagination);

  return (
    <>
      <Box>
        <Heading>Existing duplicates</Heading>
        <TableContainer overflowX="unset" overflowY="unset">
          <Table variant="simple">
            <TableCaption>List of existing duplicates</TableCaption>
            <Thead position="sticky" top={0} zIndex="docked" bg="white">
              <Tr>
                <Th>Participant ID A</Th>
                <Th>Participant ID B</Th>
                <Th>Likely hood</Th>
                <Th>Updated At</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.map((duplicate) => (
                <Tr
                  key={`${duplicate.participantA?.id}-${duplicate.participantB?.id}`}
                  onClick={() => setSelectedDuplicate(duplicate)}
                >
                  <Td>{duplicate.participantA?.id}</Td>
                  <Td>{duplicate.participantB?.id}</Td>
                  <Td>{duplicate.weightedScore}</Td>
                  <Td>{duplicate.updatedAt.toLocaleDateString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Box>
          <Button onClick={previousPage}>Previous</Button>
          <Button onClick={nextPage}>Next</Button>
        </Box>
      </Box>
      <Modal
        isOpen={Boolean(selectedDuplicate)}
        onClose={() => setSelectedDuplicate(null)}
        size="full"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDuplicate && (
              <DuplicateDetail duplicate={selectedDuplicate} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

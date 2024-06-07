import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';

import { DenormalisedDeduplicationRecord } from '@nrcno/core-models';

type Props = {
  data: DenormalisedDeduplicationRecord[];
  onRowClick: (duplicate: DenormalisedDeduplicationRecord) => void;
};

export const DuplicateListTable: React.FC<Props> = ({ data, onRowClick }) => (
  <TableContainer overflowY="auto" height="100%">
    <Table variant="simple" size="sm">
      <Thead zIndex={'docked'} position={'sticky'} top={'0'} bg="white">
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
            onClick={() => onRowClick(duplicate)}
            _hover={{ bg: 'primary.200' }}
            cursor="pointer"
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
);

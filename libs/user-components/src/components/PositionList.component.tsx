import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { PositionListItem } from '@nrcno/core-models';

type Props = {
  positions: PositionListItem[];
  onRowClick: (position: PositionListItem) => void;
};

export const PositionList: React.FC<Props> = ({ positions, onRowClick }) => {
  return (
    <TableContainer overflowY="auto" height="100%">
      <Table variant="striped" size="md">
        <Thead zIndex={'docked'} position={'sticky'} top={'0'} bg="white">
          <Tr>
            <Th>Id</Th>
            <Th>Name</Th>
          </Tr>
        </Thead>
        <Tbody>
          {positions.map((position) => (
            <Tr key={position.id} onClick={() => onRowClick(position)}>
              <Td>{position.id}</Td>
              <Td>{position.name}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

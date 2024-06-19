import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { TeamListItem } from '@nrcno/core-models';

type Props = {
  teams: TeamListItem[];
  onRowClick: (team: TeamListItem) => void;
};

export const TeamList: React.FC<Props> = ({ teams, onRowClick }) => {
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
          {teams.map((team) => (
            <Tr
              key={team.id}
              _hover={{ bg: 'primary.200' }}
              cursor="pointer"
              onClick={() => onRowClick(team)}
            >
              <Td>{team.id}</Td>
              <Td>{team.name}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

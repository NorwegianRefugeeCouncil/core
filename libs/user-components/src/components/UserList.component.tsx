import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { User } from '@nrcno/core-models';

type Props = {
  users: User[];
};

export const UserList: React.FC<Props> = ({ users }) => {
  return (
    <TableContainer overflowY="auto" height="100%">
      <Table variant="striped" size="md">
        <Thead zIndex={'docked'} position={'sticky'} top={'0'} bg="white">
          <Tr textStyle="bold">
            <Th>Id</Th>
            <Th>First name</Th>
            <Th>Last name</Th>
            <Th>Email</Th>
            <Th>Active</Th>
            <Th>Created</Th>
            <Th>Updated</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((user) => (
            <Tr key={user.id}>
              <Td>{user.id}</Td>
              <Td>{user.firstName}</Td>
              <Td>{user.lastName}</Td>
              <Td>
                {user.emails?.find((email) => email.primary)?.value ??
                  user.emails?.[0].value ??
                  ''}
              </Td>
              <Td>{user.active ? 'Yes' : 'No'}</Td>
              <Td>{user.createdAt.toLocaleDateString()}</Td>
              <Td>{user.updatedAt.toLocaleDateString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

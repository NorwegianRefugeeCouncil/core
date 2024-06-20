import {
  Checkbox,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { Roles } from '@nrcno/core-models';
import { useFormContext } from 'react-hook-form';

type Props = {
  fieldName: string;
};

export const RoleTable: React.FC<Props> = ({ fieldName }) => {
  const { register } = useFormContext();

  return (
    <TableContainer>
      <Table variant="striped" size="md">
        <Thead zIndex={'docked'} position={'sticky'} top={'0'} bg="white">
          <Tr>
            <Th>Role</Th>
            <Th>Enabled</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.values(Roles).map((role) => (
            <Tr key={role}>
              <Td>{role}</Td>
              <Td>
                <Checkbox {...register(`${fieldName}.${role}`)} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

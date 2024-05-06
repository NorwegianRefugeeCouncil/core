import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { EntityListItem } from '@nrcno/core-models';

import { EntityUIConfig } from '../config';

type Props = {
  config: EntityUIConfig['list'];
  entityList?: EntityListItem[];
};

export const EntityList: React.FC<Props> = ({
  config: columns,
  entityList,
}) => {
  return (
    <TableContainer>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr textStyle={'bold'}>
            {columns.map((column) => {
              return (
                <Th key={column.field} width={column.width}>
                  {column.title}
                </Th>
              );
            })}
          </Tr>
        </Thead>
        <Tbody>
          {entityList &&
            entityList.map((entity) => (
              <Tr key={entity.id}>
                {columns.map((column) => (
                  <Td key={column.field}>{entity[column.field]?.toString()}</Td>
                ))}
              </Tr>
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

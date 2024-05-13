import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link as ReactRouterLink } from 'react-router-dom';
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
        <Thead zIndex={'docked'} position={'sticky'} top={'0'}>
          <Tr textStyle="bold">
            {columns.map((column) => {
              return (
                <Th key={column.field} width={`${column.width}rem`}>
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
                  <Td key={column.field} width={`${column.width}rem`}>
                    {column.isID && (
                      <ChakraLink
                        color="secondary.500"
                        href="#"
                        as={ReactRouterLink}
                        to={`${entity[column.field]}`}
                      >
                        {entity[column.field]?.toString()}
                      </ChakraLink>
                    )}

                    {!column.isID &&
                      (column.format
                        ? column.format(entity[column.field])
                        : entity[column.field]?.toString())}
                  </Td>
                ))}
              </Tr>
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

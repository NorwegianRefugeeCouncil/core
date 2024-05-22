import { Table, TableContainer, Tbody, Thead, Tr } from '@chakra-ui/react';
import { Entity } from '@nrcno/core-models';

import { EntityUIConfig } from '../../config';

import { ColumnHeader } from './ColumnHeader.component';
import { IdCell } from './IdCell.component';
import { Cell } from './Cell.component';

type Props = {
  config: EntityUIConfig['list'];
  entityList?: Partial<Entity>[];
};

export const EntityList: React.FC<Props> = ({
  config: { fields },
  entityList,
}) => {
  return (
    <TableContainer overflowY="auto" height="100%">
      <Table variant="striped" size="sm">
        <Thead zIndex={'docked'} position={'sticky'} top={'0'} bg="white">
          <Tr textStyle="bold">
            {fields.map((field) => (
              <ColumnHeader key={field.path.join('.')} field={field} />
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {entityList &&
            entityList.map((entity) => (
              <Tr key={entity.id}>
                {fields.map((field) =>
                  field.isID ? (
                    <IdCell
                      key={field.path.join('.')}
                      field={field}
                      entity={entity}
                    />
                  ) : (
                    <Cell
                      key={field.path.join('.')}
                      field={field}
                      entity={entity}
                    />
                  ),
                )}
              </Tr>
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

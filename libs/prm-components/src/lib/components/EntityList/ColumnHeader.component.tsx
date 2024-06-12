import { Flex, Th, Text } from '@chakra-ui/react';
import { Sorting } from '@nrcno/core-models';

import { EntityUIConfig } from '../../config';

import { SortIcon } from './SortIcon.component';

type Props = {
  field: EntityUIConfig['list']['fields'][0];
  isSorted: boolean;
  sorting: Sorting;
  updateSorting: (sorting: Sorting) => void;
};

export const ColumnHeader: React.FC<Props> = ({
  field,
  isSorted,
  sorting,
  updateSorting,
}) => {
  return (
    <Th width={`${field.width}rem`}>
      <Flex justify="space-between" alignItems="center">
        <Text me="2">{field.title}</Text>
        <SortIcon
          field={field.sortKey}
          handleClick={updateSorting}
          isActive={isSorted}
          direction={sorting.direction}
        />
      </Flex>
    </Th>
  );
};

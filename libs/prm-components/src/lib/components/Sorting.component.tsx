import * as React from 'react';
import { Flex, Select, Text } from '@chakra-ui/react';
import { Sorting, SortingDirection } from '@nrcno/core-models';
type Props = {
  fields: string[] | readonly string[];
  sorting: Sorting;
  onChange: (sorting: Sorting) => void;
};

export const SortingControl = ({ fields, sorting, onChange }: Props) => {
  const handleChangeSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sort = event.target.value;
    const newSorting = { ...sorting, sort };
    onChange(newSorting);
  };

  const handleChangeDirection = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const direction = event.target.value as SortingDirection;
    const newSorting = { ...sorting, direction };
    onChange(newSorting);
  };

  return (
    <Flex direction="column" gap={1}>
      <Text>Sort by:</Text>
      <Flex direction="row" gap={4}>
        <Select value={sorting.sort} onChange={handleChangeSort}>
          {fields.map((field, index) => (
            <option key={index} value={field}>
              {field}
            </option>
          ))}
        </Select>
        <Select value={sorting.direction} onChange={handleChangeDirection}>
          {Object.values(SortingDirection).map((direction) => (
            <option key={direction} value={direction}>
              {direction}
            </option>
          ))}
        </Select>
      </Flex>
    </Flex>
  );
};

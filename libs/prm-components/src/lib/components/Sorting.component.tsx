import { Flex, Text } from '@chakra-ui/react';
import { Select, SingleValue } from 'chakra-react-select';
import { Sorting, SortingDirection } from '@nrcno/core-models';
type Props = {
  fields: string[] | readonly string[];
  sorting: Sorting;
  onChange: (sorting: Sorting) => void;
};

export const SortingControl = ({ fields, sorting, onChange }: Props) => {
  const handleChangeSort = (
    value: SingleValue<{
      value: string;
      label: string;
    }>,
  ) => {
    if (value) {
      onChange({ ...sorting, sort: value.value });
    }
  };

  const handleChangeDirection = (
    value: SingleValue<{
      value: SortingDirection;
      label: SortingDirection;
    }>,
  ) => {
    if (value) {
      onChange({ ...sorting, direction: value.value });
    }
  };

  const sortOptions = fields.map((field) => ({
    value: field,
    label: field,
  }));

  const directionOptions = Object.values(SortingDirection).map((direction) => ({
    value: direction,
    label: direction,
  }));

  return (
    <Flex direction="column" gap={1}>
      <Text>Sort by:</Text>
      <Flex direction="row" gap={4}>
        <Select
          value={sortOptions.find((option) => option.value === sorting.sort)}
          options={sortOptions}
          onChange={handleChangeSort}
          menuPortalTarget={document.getElementById('react-select-portal')}
          defaultMenuIsOpen
        />
        <Select
          value={directionOptions.find(
            (direction) => direction.value === sorting.direction,
          )}
          options={directionOptions}
          onChange={handleChangeDirection}
          menuPortalTarget={document.getElementById('react-select-portal')}
        />
      </Flex>
    </Flex>
  );
};

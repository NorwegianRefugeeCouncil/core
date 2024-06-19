import { useState } from 'react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Select,
  Text,
} from '@chakra-ui/react';
import { PositionListItem } from '@nrcno/core-models';
import { useFormContext, useFieldArray, useController } from 'react-hook-form';

type Props = {
  positions: PositionListItem[];
};

export const TeamPosition: React.FC<Props> = ({ positions }) => {
  const [positionId, setPositionId] = useState<string | null>(null);

  const {
    control,
    formState: { disabled },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'positions',
  });

  const handleAppend = () => {
    if (positionId) {
      append(positionId);
      setPositionId(null);
    }
  };

  return (
    <Flex direction="column" gap={4}>
      <Heading as="h4" size="sm">
        Position
      </Heading>
      {!disabled && (
        <Flex gap={4} w="100%" alignItems="center">
          <Text style={{ whiteSpace: 'nowrap' }}>Add position: </Text>
          <Select
            placeholder="Select position"
            onChange={(e) => setPositionId(e.target.value)}
            value={positionId || ''}
          >
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </Select>
          <IconButton
            aria-label="Add"
            onClick={handleAppend}
            size="sm"
            disabled={!positionId}
          >
            <AddIcon />
          </IconButton>
        </Flex>
      )}
      <Grid templateColumns="1fr auto auto" gap={4} alignItems="center">
        {fields.map((field: Record<'id', string>, i: number) => {
          return (
            <>
              <GridItem key={`1-${field.id}`} />
              <GridItem key={`2-${field.id}`}>
                <TeamPositionField idx={i} positions={positions} />
              </GridItem>
              <GridItem key={`3-${field.id}`}>
                {!disabled && (
                  <IconButton aria-label="Remove" onClick={() => remove(i)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </GridItem>
            </>
          );
        })}
      </Grid>
    </Flex>
  );
};

const TeamPositionField: React.FC<{
  idx: number;
  positions: PositionListItem[];
}> = ({ idx, positions }) => {
  const { control } = useFormContext();
  const { field } = useController({
    name: `positions.${idx}`,
    control,
  });

  const position = positions.find((u) => u.id === field.value);
  if (!position) return null;
  return <Text>{position.name}</Text>;
};

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
import { User } from '@nrcno/core-models';
import { useFormContext, useFieldArray, useController } from 'react-hook-form';

type Props = {
  users: User[];
};

export const PositionStaff: React.FC<Props> = ({ users }) => {
  const [staffId, setStaffId] = useState<string | null>(null);

  const {
    control,
    formState: { disabled },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'staff',
  });

  const handleAppend = () => {
    if (staffId) {
      append(staffId);
      setStaffId(null);
    }
  };

  return (
    <Flex direction="column" gap={4}>
      <Heading as="h4" size="sm">
        Staff
      </Heading>
      {!disabled && (
        <Flex gap={4} w="100%" alignItems="center">
          <Text style={{ whiteSpace: 'nowrap' }}>Add staff: </Text>
          <Select
            placeholder="Select staff"
            onChange={(e) => setStaffId(e.target.value)}
            value={staffId || ''}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName}
              </option>
            ))}
          </Select>
          <IconButton
            aria-label="Add"
            onClick={handleAppend}
            size="sm"
            disabled={!staffId}
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
                <PositionStaffField idx={i} users={users} />
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

const PositionStaffField: React.FC<{ idx: number; users: User[] }> = ({
  idx,
  users,
}) => {
  const { control } = useFormContext();
  const { field } = useController({
    name: `staff.${idx}`,
    control,
  });

  const user = users.find((u) => u.id === field.value);
  console.log(field, user, users);
  if (!user) return null;
  const email =
    (user.emails?.find((e) => e.primary)?.value || user.emails?.[0]?.value) ??
    '';

  return (
    <Text>
      {user.displayName} ({email})
    </Text>
  );
};

import {
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Select,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { useUserContext } from '@nrcno/core-user-components';

export const DeveloperTools = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const {
    me,
    user: { list },
  } = useUserContext();

  useEffect(() => {
    list.getUserList({
      startIndex: 0,
      pageSize: 100,
    });
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      me.getMe();
    }
  }, [selectedUserId]);

  return (
    <Flex direction="column" gap={4}>
      <Heading>Developer Tools</Heading>
      <FormControl>
        <FormLabel>Select User</FormLabel>
        <Select
          placeholder="Select User"
          onChange={(e) => setSelectedUserId(e.target.value)}
        >
          <option value="">Default user</option>
          {list.data?.items.map((user) => (
            <option key={user.id} value={user.id}>
              {user.displayName}
            </option>
          ))}
        </Select>
      </FormControl>
    </Flex>
  );
};

import {
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Select,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { useUserContext } from '@nrcno/core-user-components';

import { useAxiosInstance } from './ApiProvider.component';

export const DeveloperTools = () => {
  const {
    me,
    user: { list },
  } = useUserContext();

  const [selectedUserId, setSelectedUserId] = useState<string>(
    me.data?.id || '',
  );

  const axiosInstance = useAxiosInstance();

  useEffect(() => {
    list.getUserList({
      startIndex: 0,
      pageSize: 100,
    });
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      axiosInstance.defaults.headers['x-override-user-id'] = selectedUserId;
    } else {
      delete axiosInstance.defaults.headers['x-override-user-id'];
    }
    // me.getMe();
  }, [selectedUserId]);

  useEffect(() => {
    setSelectedUserId(me.data?.id || '');
  }, [me.data?.id]);

  return (
    <Flex direction="column" gap={4}>
      <Heading>Developer Tools</Heading>
      <FormControl>
        <FormLabel>Select User</FormLabel>
        <Select
          placeholder="Select User"
          onChange={(e) => setSelectedUserId(e.target.value)}
          value={selectedUserId}
        >
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

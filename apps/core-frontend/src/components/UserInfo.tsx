import { Flex, Text } from '@chakra-ui/react';

import { User } from '@nrcno/core-models';

export const UserInfo: React.FC<User> = ({ displayName, userName }) => {
  return (
    <Flex
      align={'flex-end'}
      flexDirection="column"
      fontSize="sm"
      fontWeight={'normal'}
    >
      <Text>{displayName}</Text>
      <Text>{userName}</Text>
    </Flex>
  );
};

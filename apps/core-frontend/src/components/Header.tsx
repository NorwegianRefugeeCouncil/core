import { Flex, Heading } from '@chakra-ui/react';
import { NRCLogo } from '@nrcno/core-theme';

import { User } from '@nrcno/core-models';

import { UserInfo } from './UserInfo';

type HeaderProps = {
  user?: User;
};

export const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <Flex align="center">
      <Flex justify="flex-start" align="center" flex="1rem 1">
        <NRCLogo height="2rem" width="2rem" me="1rem" />
        <Heading>CORE</Heading>
      </Flex>
      {user && <UserInfo {...user} />}
    </Flex>
  );
};

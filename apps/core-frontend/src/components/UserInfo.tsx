import { Flex, Typography } from 'antd';

import { User } from '@nrcno/core-models';

export const UserInfo: React.FC<User> = ({ displayName, userName }) => {
  return (
    <Flex vertical align="flex-end">
      <Typography.Text style={{ color: 'white' }}>
        {displayName}
      </Typography.Text>
      <Typography.Text style={{ color: 'white' }}>{userName}</Typography.Text>
    </Flex>
  );
};

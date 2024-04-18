import { Typography } from 'antd';

import { User } from '@nrcno/core-models';

export const UserInfo: React.FC<User> = ({ displayName, id }) => {
  return <Typography.Text>{displayName}</Typography.Text>;
};

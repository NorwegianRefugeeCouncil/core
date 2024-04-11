import { Typography } from 'antd';

import { User } from '@nrcno/core-models';

export const UserInfo: React.FC<User> = ({ displayName, id }) => {
  return (
    <>
      <Typography.Title>{displayName}</Typography.Title>
      <Typography.Paragraph>{id}</Typography.Paragraph>
    </>
  );
};

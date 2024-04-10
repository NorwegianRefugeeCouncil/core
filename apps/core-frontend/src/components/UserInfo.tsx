import { User } from '@nrcno/core-models';

export const UserInfo: React.FC<User> = ({ displayName, id }) => {
  return (
    <>
      <h1>{displayName}</h1>
      <p>{id}</p>
    </>
  );
};

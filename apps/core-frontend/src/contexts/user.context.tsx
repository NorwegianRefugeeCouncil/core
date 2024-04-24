import * as React from 'react';
import { AxiosInstance } from 'axios';

import { UserClient } from '@nrcno/core-clients';

import { MeState, useMe, defaultMeState } from '../hooks/useMe.hook';

type Props = {
  axiosInstance: AxiosInstance;
  children: React.ReactNode;
};

type UserContextData = {
  me: MeState;
};

export const UserContext = React.createContext<UserContextData>({
  me: defaultMeState,
});

export const UserProvider: React.FC<Props> = ({ axiosInstance, children }) => {
  const userClient = new UserClient(axiosInstance);

  const me = useMe(userClient);

  return <UserContext.Provider value={{ me }}>{children}</UserContext.Provider>;
};

export const useUsers = () => {
  const userContext = React.useContext(UserContext);
  return userContext;
};

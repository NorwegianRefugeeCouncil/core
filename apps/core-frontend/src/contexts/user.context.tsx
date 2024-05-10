import * as React from 'react';
import { AxiosInstance } from 'axios';

import { UserClient } from '@nrcno/core-clients';
import { SubmitStatus } from '@nrcno/core-prm-components';

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

  React.useEffect(() => {
    me.getMe();
  }, []);

  // Use /api/me as an authentication check
  if (me.status !== SubmitStatus.SUCCESS) return;

  return <UserContext.Provider value={{ me }}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const userContext = React.useContext(UserContext);
  return userContext;
};

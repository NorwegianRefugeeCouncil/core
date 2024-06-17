import * as React from 'react';
import { AxiosInstance } from 'axios';
import { PositionClient, UserClient } from '@nrcno/core-clients';
import { SubmitStatus } from '@nrcno/core-shared-frontend';

import { MeState, useMe, defaultMeState } from './hooks/useMe.hook';
import {
  defaultUserListState,
  UserListState,
  useUserList,
} from './hooks/useUserList.hook';
import {
  defaultPositionListState,
  PositionListState,
  usePositionList,
} from './hooks/usePositionList.hook';

type Props = {
  axiosInstance: AxiosInstance;
  children: React.ReactNode;
};

type UserContextData = {
  me: MeState;
  user: {
    list: UserListState;
  };
  position: {
    list: PositionListState;
  };
};

export const UserContext = React.createContext<UserContextData>({
  me: defaultMeState,
  user: {
    list: defaultUserListState,
  },
  position: {
    list: defaultPositionListState,
  },
});

export const UserProvider: React.FC<Props> = ({ axiosInstance, children }) => {
  const userClient = React.useMemo(
    () => new UserClient(axiosInstance),
    [axiosInstance],
  );
  const positionClient = React.useMemo(
    () => new PositionClient(axiosInstance),
    [axiosInstance],
  );

  const me = useMe(userClient);
  const userList = useUserList(userClient);
  const positionList = usePositionList(positionClient);

  React.useEffect(() => {
    me.getMe();
  }, []);

  // Use /api/me as an authentication check
  if (me.status !== SubmitStatus.SUCCESS) return;

  return (
    <UserContext.Provider
      value={{
        me,
        user: {
          list: userList,
        },
        position: {
          list: positionList,
        },
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const userContext = React.useContext(UserContext);
  return userContext;
};

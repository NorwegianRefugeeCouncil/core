import * as React from 'react';
import { AxiosInstance } from 'axios';
import { PositionClient, TeamClient, UserClient } from '@nrcno/core-clients';
import { SubmitStatus } from '@nrcno/core-shared-frontend';

import { MeState, useMe, defaultMeState } from './hooks/useMe.hook';
import {
  defaultUserListState,
  UserListState,
  useUserList,
} from './hooks/useUserList.hook';
import {
  defaultPositionState,
  PositionState,
  usePosition,
} from './hooks/usePosition.hook';
import { TeamState, defaultTeamState, useTeam } from './hooks/useTeam.hook';

type Props = {
  axiosInstance: AxiosInstance;
  children: React.ReactNode;
};

type UserContextData = {
  me: MeState;
  user: {
    list: UserListState;
  };
  position: PositionState;
  team: TeamState;
};

export const UserContext = React.createContext<UserContextData>({
  me: defaultMeState,
  user: {
    list: defaultUserListState,
  },
  position: defaultPositionState,
  team: defaultTeamState,
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
  const teamClient = React.useMemo(
    () => new TeamClient(axiosInstance),
    [axiosInstance],
  );

  const me = useMe(userClient);
  const userList = useUserList(userClient);
  const position = usePosition(positionClient);
  const team = useTeam(teamClient);

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
        position,
        team,
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

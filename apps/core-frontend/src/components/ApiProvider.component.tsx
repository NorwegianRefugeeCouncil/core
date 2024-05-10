import { Outlet, useParams } from 'react-router-dom';

import { PrmProvider } from '@nrcno/core-prm-components';

import { useAxiosInstance } from '../hooks/useAxiosInstance.hook';
import { UserProvider } from '../contexts/user.context';

export const ApiProvider: React.FC = () => {
  const { entityType, entityId } = useParams();

  const axiosInstance = useAxiosInstance();

  return (
    <UserProvider axiosInstance={axiosInstance}>
      <PrmProvider
        axiosInstance={axiosInstance}
        entityType={entityType}
        entityId={entityId}
      >
        <Outlet />
      </PrmProvider>
    </UserProvider>
  );
};

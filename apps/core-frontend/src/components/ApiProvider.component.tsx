import { Outlet, useParams } from 'react-router-dom';

import { PrmProvider } from '@nrcno/core-prm-components';
import { DeduplicationProvider } from '@nrcno/core-deduplication-components';
import { EntityType } from '@nrcno/core-models';

import { useAxiosInstance } from '../hooks/useAxiosInstance.hook';
import { UserProvider } from '../contexts/user.context';

export const ApiProvider: React.FC = () => {
  const { entityType, entityId } = useParams();

  const individualId =
    entityType === EntityType.Individual ? entityId : undefined;

  const axiosInstance = useAxiosInstance();

  return (
    <UserProvider axiosInstance={axiosInstance}>
      <PrmProvider
        axiosInstance={axiosInstance}
        entityType={entityType}
        entityId={entityId}
      >
        <DeduplicationProvider
          axiosInstance={axiosInstance}
          individualId={individualId}
        >
          <Outlet />
        </DeduplicationProvider>
      </PrmProvider>
    </UserProvider>
  );
};

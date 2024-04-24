import { PrmProvider } from '@nrcno/core-prm-components';

import { useAxiosInstance } from '../hooks/useAxiosInstance.hook';
import { UserProvider } from '../contexts/user.context';

type Props = {
  children: React.ReactNode;
};

export const FeatureProvider: React.FC<Props> = ({ children }) => {
  const axiosInstance = useAxiosInstance();

  return (
    <UserProvider axiosInstance={axiosInstance}>
      <PrmProvider axiosInstance={axiosInstance}>{children}</PrmProvider>
    </UserProvider>
  );
};

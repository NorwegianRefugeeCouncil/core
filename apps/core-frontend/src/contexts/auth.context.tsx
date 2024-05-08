import { useEffect, useState } from 'react';
import { AxiosInstance } from 'axios';

type Props = {
  axiosInstance: AxiosInstance;
  children: React.ReactNode;
};

export const AuthProvider: React.FC<Props> = ({ axiosInstance, children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    axiosInstance.get('/auth').then(() => setIsAuthenticated(true));
  }, [axiosInstance]);

  if (!isAuthenticated) {
    return <div />;
  }

  return children;
};

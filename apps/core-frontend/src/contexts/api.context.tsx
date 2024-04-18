import { createContext } from 'react';

import { UserClient } from '@nrcno/core-clients';

import { ApiContextType } from '../types/contexts';

export const ApiContext = createContext<ApiContextType | null>(null);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const users = new UserClient({
    baseURL: '/api',
  });
  users.client.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response.status === 401) {
        window.location.href = `/login`;
      }
      return error;
    },
  );
  const clients = { users };

  return <ApiContext.Provider value={clients}>{children}</ApiContext.Provider>;
};

import { createContext, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { UserClient } from '@nrcno/core-clients';

import { ApiContextType } from '../types/contexts';

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const authCookieName = 'connect.sid';

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

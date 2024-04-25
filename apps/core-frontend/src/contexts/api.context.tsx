import { createContext } from 'react';
import axios from 'axios';

import { UserClient } from '@nrcno/core-clients';

import { ApiContextType } from '../types/contexts';

export const ApiContext = createContext<ApiContextType | null>(null);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const axiosInstance = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
  axiosInstance.interceptors.response.use(
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
  const users = new UserClient(axiosInstance);
  const clients = { users };

  return <ApiContext.Provider value={clients}>{children}</ApiContext.Provider>;
};

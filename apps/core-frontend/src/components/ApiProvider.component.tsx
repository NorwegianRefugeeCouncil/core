import { Outlet, useParams } from 'react-router-dom';
import { createContext, useContext, useMemo } from 'react';
import axios, { AxiosInstance } from 'axios';
import { ZodError } from 'zod';

import { UserProvider } from '@nrcno/core-user-components';
import { PrmProvider } from '@nrcno/core-prm-components';

type ApiContextData = {
  axiosInstance: AxiosInstance;
};

const ApiContext = createContext<ApiContextData>({
  axiosInstance: axios.create(),
});

export const ApiProvider: React.FC = () => {
  const { entityType, entityId } = useParams();

  const axiosInstance = useMemo(() => {
    const ai = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    ai.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response.status === 401) {
          window.location.href = `/login`;
        }
        if (error.response.status === 400) {
          try {
            throw new ZodError(error.response.data);
          } catch {
            throw error;
          }
        }
        throw error;
      },
    );

    return ai;
  }, []);

  return (
    <ApiContext.Provider value={{ axiosInstance }}>
      <UserProvider axiosInstance={axiosInstance}>
        <PrmProvider
          axiosInstance={axiosInstance}
          entityType={entityType}
          entityId={entityId}
        >
          <Outlet />
        </PrmProvider>
      </UserProvider>
    </ApiContext.Provider>
  );
};

export const useAxiosInstance = () => {
  return useContext(ApiContext).axiosInstance;
};

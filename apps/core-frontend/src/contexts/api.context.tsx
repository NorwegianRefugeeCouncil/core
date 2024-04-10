import { createContext } from 'react';

import { ScimClient } from '@nrcno/core-clients';

import { ApiContextType } from '../types/contexts';

const BASE_API_URL = import.meta.env.BASE_URL;

export const ApiContext = createContext<ApiContextType | null>(null);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const scim = new ScimClient({ baseURL: BASE_API_URL });
  const clients = { scim };

  return <ApiContext.Provider value={clients}>{children}</ApiContext.Provider>;
};

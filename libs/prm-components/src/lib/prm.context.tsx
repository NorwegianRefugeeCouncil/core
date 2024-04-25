import * as React from 'react';
import { AxiosInstance } from 'axios';
import { PrmClient } from '@nrcno/core-clients';
import { EntityType } from '@nrcno/core-models';

import {
  CreateEntityState,
  defaultCreateEntityState,
  useCreateEntity,
} from './hooks';
import {
  ReadEntityState,
  defaultReadEntityState,
  useReadEntity,
} from './hooks/useReadEntity.hook';

type Props = {
  axiosInstance: AxiosInstance;
  children: React.ReactNode;
};

type PrmContextData = {
  create: CreateEntityState;
  read: ReadEntityState;
};

export const PrmContext = React.createContext<PrmContextData>({
  create: defaultCreateEntityState,
  read: defaultReadEntityState,
});

export const usePrmContext = () => React.useContext(PrmContext);

export const PrmProvider: React.FC<Props> = ({ axiosInstance, children }) => {
  const entityType = EntityType.Participant;

  const prmClient = React.useMemo(
    () => new PrmClient(axiosInstance),
    [axiosInstance],
  );

  const client = React.useMemo(
    () => prmClient[entityType],
    [prmClient, entityType],
  );

  const create = useCreateEntity(client);
  const read = useReadEntity(client);

  return (
    <PrmContext.Provider value={{ create, read }}>
      {children}
    </PrmContext.Provider>
  );
};

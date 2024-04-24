import * as React from 'react';
import { AxiosInstance } from 'axios';
import { PrmClient } from '@nrcno/core-clients';
import { EntityType } from '@nrcno/core-models';

import {
  CreateEntityState,
  defaultCreateEntityState,
  useCreateEntity,
} from './hooks';

type Props = {
  axiosInstance: AxiosInstance;
  children: React.ReactNode;
};

type PrmContextData = {
  create: CreateEntityState;
};

export const PrmContext = React.createContext<PrmContextData>({
  create: defaultCreateEntityState,
});

export const usePrm = () => React.useContext(PrmContext);

export const PrmProvider = PrmContext.Provider;

export const PrmConsumer = PrmContext.Consumer;

export const Prm: React.FC<Props> = ({ axiosInstance, children }) => {
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

  return <PrmProvider value={{ create }}>{children}</PrmProvider>;
};

import * as React from 'react';
import { AxiosInstance } from 'axios';
import { PrmClient } from '@nrcno/core-clients';
import { useLoaderData, useParams } from 'react-router-dom';
import { EntityType, EntityTypeSchema } from '@nrcno/core-models';

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
  entityType: string | undefined;
  entityId: string | undefined;
  children: React.ReactNode;
};

type PrmContextData = {
  entityType: EntityType | undefined;
  entityId: string | undefined;
  create: CreateEntityState;
  read: ReadEntityState;
};

export const PrmContext = React.createContext<PrmContextData>({
  entityType: undefined,
  entityId: undefined,
  create: defaultCreateEntityState,
  read: defaultReadEntityState,
});

export const usePrmContext = () => React.useContext(PrmContext);

export const PrmProvider: React.FC<Props> = ({
  axiosInstance,
  entityType,
  entityId,
  children,
}) => {
  const validEntityType = EntityTypeSchema.optional().parse(entityType);

  const prmClient = React.useMemo(
    () => new PrmClient(axiosInstance),
    [axiosInstance],
  );

  const client = React.useMemo(
    () => (validEntityType ? prmClient[validEntityType] : undefined),
    [prmClient, entityType],
  );

  const create = useCreateEntity(client);
  const read = useReadEntity(client);

  return (
    <PrmContext.Provider
      value={{
        entityType: validEntityType,
        entityId,
        create,
        read,
      }}
    >
      {children}
    </PrmContext.Provider>
  );
};

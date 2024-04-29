import * as React from 'react';
import { AxiosInstance } from 'axios';
import { PrmClient } from '@nrcno/core-clients';
import { EntityType, EntityTypeSchema } from '@nrcno/core-models';

import {
  CreateEntityState,
  defaultCreateEntityState,
  useCreateEntity,
} from './hooks/useCreateEntity.hook';
import {
  ReadEntityState,
  defaultReadEntityState,
  useReadEntity,
} from './hooks/useReadEntity.hook';
import {
  EditEntityState,
  defaultEditEntityState,
  useEditEntity,
} from './hooks/useEditEntity.hook';

type Props = {
  axiosInstance: AxiosInstance;
  entityType: string | undefined;
  entityId: string | undefined;
  children: React.ReactNode;
};

export type PrmContextData = {
  entityType: EntityType | undefined;
  entityId: string | undefined;
  create: CreateEntityState;
  read: ReadEntityState;
  edit: EditEntityState;
};

export const PrmContext = React.createContext<PrmContextData>({
  entityType: undefined,
  entityId: undefined,
  create: defaultCreateEntityState,
  read: defaultReadEntityState,
  edit: defaultEditEntityState,
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
    [prmClient, validEntityType],
  );

  const create = useCreateEntity(client);
  const read = useReadEntity(client);
  const edit = useEditEntity(client);

  return (
    <PrmContext.Provider
      value={{
        entityType: validEntityType,
        entityId,
        create,
        read,
        edit,
      }}
    >
      {children}
    </PrmContext.Provider>
  );
};

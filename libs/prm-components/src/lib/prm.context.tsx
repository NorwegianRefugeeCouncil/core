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
import {
  ListEntityState,
  defaultListEntityState,
  useListEntity,
} from './hooks/useListEntity.hook';
import { PrmUIConfig, configLoader } from './config';
import { useLoadStaticData } from './hooks/useLoadStaticData.hook';

type Props = {
  axiosInstance: AxiosInstance;
  entityType: string | undefined;
  entityId: string | undefined;
  children: React.ReactNode;
};

export type PrmContextData = {
  config: PrmUIConfig | undefined;
  entityType: EntityType | undefined;
  entityId: string | undefined;
  create: CreateEntityState;
  read: ReadEntityState;
  edit: EditEntityState;
  list: ListEntityState;
};

export const PrmContext = React.createContext<PrmContextData>({
  config: undefined,
  entityType: undefined,
  entityId: undefined,
  create: defaultCreateEntityState,
  read: defaultReadEntityState,
  edit: defaultEditEntityState,
  list: defaultListEntityState,
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

  const staticData = useLoadStaticData(prmClient);

  const create = useCreateEntity(client);
  const read = useReadEntity(client);
  const edit = useEditEntity(client);
  const list = useListEntity(client);

  React.useEffect(() => {
    create.reset();
    read.reset();
    edit.reset();
    list.reset();
  }, [validEntityType]);

  const config = configLoader(
    staticData.data ?? { languages: [], nationalities: [] },
  );

  return (
    <PrmContext.Provider
      value={{
        config,
        entityType: validEntityType,
        entityId,
        create,
        read,
        edit,
        list,
      }}
    >
      {children}
    </PrmContext.Provider>
  );
};

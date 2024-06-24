import * as React from 'react';
import { AxiosInstance } from 'axios';

import { DeduplicationClient } from '@nrcno/core-clients';

import {
  DuplicateListState,
  defaultDuplicateListState,
  useDuplicateList,
} from './hooks/useDuplicateList';
import {
  ResolveDuplicateState,
  defaultResolveDuplicateState,
  useResolveDuplicate,
} from './hooks/useResolveDuplicate';
import {
  CheckDuplicatesState,
  defaultCheckDuplicatesState,
  useCheckDuplicates,
} from './hooks/useCheckDuplicates';

type Props = {
  axiosInstance: AxiosInstance;
  individualId: string | undefined;
  children: React.ReactNode;
};

export type DeduplicationContextData = {
  individualId: string | undefined;
  list: DuplicateListState;
  resolve: ResolveDuplicateState;
  check: CheckDuplicatesState;
};

export const DeduplicationContext =
  React.createContext<DeduplicationContextData>({
    individualId: undefined,
    list: defaultDuplicateListState,
    resolve: defaultResolveDuplicateState,
    check: defaultCheckDuplicatesState,
  });

export const useDeduplicationContext = () =>
  React.useContext(DeduplicationContext);

export const DeduplicationProvider: React.FC<Props> = ({
  axiosInstance,
  individualId,
  children,
}) => {
  const client = React.useMemo(
    () => new DeduplicationClient(axiosInstance),
    [axiosInstance],
  );

  const list = useDuplicateList(client);
  const resolve = useResolveDuplicate(client);
  const check = useCheckDuplicates(client);

  return (
    <DeduplicationContext.Provider
      value={{ individualId, list, resolve, check }}
    >
      {children}
    </DeduplicationContext.Provider>
  );
};

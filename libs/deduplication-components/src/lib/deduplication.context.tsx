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
  participantId: string | undefined;
  children: React.ReactNode;
};

export type DeduplicationContextData = {
  participantId: string | undefined;
  list: DuplicateListState;
  resolve: ResolveDuplicateState;
  check: CheckDuplicatesState;
};

export const DeduplicationContext =
  React.createContext<DeduplicationContextData>({
    participantId: undefined,
    list: defaultDuplicateListState,
    resolve: defaultResolveDuplicateState,
    check: defaultCheckDuplicatesState,
  });

export const useDeduplicationContext = () =>
  React.useContext(DeduplicationContext);

export const DeduplicationProvider: React.FC<Props> = ({
  axiosInstance,
  participantId,
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
      value={{ participantId, list, resolve, check }}
    >
      {children}
    </DeduplicationContext.Provider>
  );
};

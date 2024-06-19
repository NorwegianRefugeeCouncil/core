import { PaginatedResponse, Pagination } from '@nrcno/core-models';
import { SubmitStatus, useApiReducer } from '@nrcno/core-shared-frontend';

export type CRUDState<T, TListItem, TDefinition, TPartial> = {
  create: {
    onCreate: (data: TDefinition) => Promise<T>;
    data?: T;
    status: SubmitStatus;
    error?: Error;
    reset: () => void;
  };
  read: {
    onRead: (id: string) => Promise<T>;
    data?: T;
    status: SubmitStatus;
    error?: Error;
  };
  list: {
    onList: (pagination: Pagination) => Promise<PaginatedResponse<TListItem>>;
    data?: PaginatedResponse<TListItem>;
    status: SubmitStatus;
    error?: Error;
  };
  update: {
    onUpdate: (id: string, data: TPartial) => Promise<T>;
    data?: T;
    status: SubmitStatus;
    error?: Error;
    reset: () => void;
  };
  delete: {
    onDelete: (id: string) => Promise<void>;
    status: SubmitStatus;
    error?: Error;
    reset: () => void;
  };
};

export const defaultCRUDState: CRUDState<any, any, any, any> = {
  create: {
    onCreate: async () => Promise.reject(),
    data: undefined,
    status: SubmitStatus.IDLE,
    error: undefined,
    reset: () => {
      return;
    },
  },
  read: {
    onRead: async () => Promise.reject(),
    data: undefined,
    status: SubmitStatus.IDLE,
    error: undefined,
  },
  list: {
    onList: async () => Promise.reject(),
    data: undefined,
    status: SubmitStatus.IDLE,
    error: undefined,
  },
  update: {
    onUpdate: async () => Promise.reject(),
    data: undefined,
    status: SubmitStatus.IDLE,
    error: undefined,
    reset: () => {
      return;
    },
  },
  delete: {
    onDelete: async () => Promise.reject(),
    status: SubmitStatus.IDLE,
    error: undefined,
    reset: () => {
      return;
    },
  },
};

type CRUDClient<T, TListItem, TDefinition, TPartial> = {
  create: (data: TDefinition) => Promise<T>;
  read: (id: string) => Promise<T>;
  list: (pagination: Pagination) => Promise<PaginatedResponse<TListItem>>;
  update: (id: string, data: TPartial) => Promise<T>;
  del: (id: string) => Promise<void>;
};

export const useCRUDResource = <
  T,
  TListItem,
  TDefinition,
  TPartial,
  TClient extends CRUDClient<T, TListItem, TDefinition, TPartial>,
>(
  client: TClient,
): CRUDState<T, TListItem, TDefinition, TPartial> => {
  const [createState, createActions] = useApiReducer<T>();
  const [readState, readActions] = useApiReducer<T>();
  const [listState, listActions] =
    useApiReducer<PaginatedResponse<TListItem>>();
  const [updateState, updateActions] = useApiReducer<T>();
  const [deleteState, deleteActions] = useApiReducer<void>();

  const onCreate = async (data: TDefinition): Promise<T> => {
    try {
      createActions.submitting();
      const created = await client.create(data);
      createActions.success(created);
      return created;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      createActions.error(err);
      throw err;
    }
  };

  const onRead = async (id: string): Promise<T> => {
    try {
      readActions.submitting();
      const data = await client.read(id);
      readActions.success(data);
      return data;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      readActions.error(err);
      throw err;
    }
  };

  const onList = async (
    pagination: Pagination,
  ): Promise<PaginatedResponse<TListItem>> => {
    try {
      listActions.submitting();
      const data = await client.list(pagination);
      listActions.success(data);
      return data;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      listActions.error(err);
      throw err;
    }
  };

  const onUpdate = async (id: string, data: TPartial): Promise<T> => {
    try {
      updateActions.submitting();
      const updated = await client.update(id, data);
      updateActions.success(updated);
      return updated;
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      updateActions.error(err);
      throw err;
    }
  };

  const onDelete = async (id: string): Promise<void> => {
    try {
      deleteActions.submitting();
      await client.del(id);
      deleteActions.success();
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('An error occurred');
      deleteActions.error(err);
      throw err;
    }
  };

  return {
    create: {
      onCreate,
      data: createState.data,
      status: createState.status,
      error: createState.error,
      reset: createActions.reset,
    },
    read: {
      onRead,
      data: readState.data,
      status: readState.status,
      error: readState.error,
    },
    list: {
      onList,
      data: listState.data,
      status: listState.status,
      error: listState.error,
    },
    update: {
      onUpdate,
      data: updateState.data,
      status: updateState.status,
      error: updateState.error,
      reset: updateActions.reset,
    },
    delete: {
      onDelete,
      status: deleteState.status,
      error: deleteState.error,
      reset: deleteActions.reset,
    },
  };
};

import { Pagination } from '@nrcno/core-models';

export interface BaseStore<
  TDefinition,
  TEntity,
  TPartialUpdateDefinition,
  TEntityListItem,
> {
  count: () => Promise<number>;
  create: (entity: TDefinition) => Promise<TEntity>;
  get: (id: string) => Promise<TEntity | null>;
  list: (pagination: Pagination) => Promise<TEntityListItem[]>;
  update: (id: string, entity: TPartialUpdateDefinition) => Promise<TEntity>;
}

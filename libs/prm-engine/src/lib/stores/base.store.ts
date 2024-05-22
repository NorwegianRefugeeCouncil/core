import { Pagination, Sorting } from '@nrcno/core-models';

export interface ListStore<TEntityListItem, TEntityFiltering> {
  count: (filtering: TEntityFiltering) => Promise<number>;
  list: (
    pagination: Pagination,
    sorting?: Sorting,
    filtering?: TEntityFiltering,
  ) => Promise<TEntityListItem[]>;
}

export interface GetStore<TEntity> {
  get: (id: string) => Promise<TEntity | null>;
}

export interface CreateStore<TDefinition, TEntity> {
  create: (entity: TDefinition) => Promise<TEntity>;
}

export interface UpdateStore<TEntity, TPartialUpdateDefinition> {
  update: (id: string, entity: TPartialUpdateDefinition) => Promise<TEntity>;
}

export interface BaseStore<
  TDefinition,
  TEntity,
  TPartialUpdateDefinition,
  TEntityListItem,
  TEntityFiltering,
> extends GetStore<TEntity>,
    CreateStore<TDefinition, TEntity>,
    UpdateStore<TEntity, TPartialUpdateDefinition>,
    ListStore<TEntityListItem, TEntityFiltering> {}

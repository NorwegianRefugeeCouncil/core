import { EntityFiltering, Pagination, Sorting } from '@nrcno/core-models';

export interface BaseStore<
  TDefinition,
  TEntity,
  TPartialUpdateDefinition,
  TEntityListItem,
> {
  count: (filtering: EntityFiltering) => Promise<number>;
  create: (entity: TDefinition) => Promise<TEntity>;
  get: (id: string) => Promise<TEntity | null>;
  list: (
    pagination: Pagination,
    sorting?: Sorting,
    filtering?: EntityFiltering,
  ) => Promise<TEntityListItem[]>;
  update: (id: string, entity: TPartialUpdateDefinition) => Promise<TEntity>;
}

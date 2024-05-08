export interface BaseStore<
  TDefinition,
  TEntity,
  TPartialUpdateDefinition,
  TEntityListItem,
> {
  count: () => Promise<number>;
  create: (entity: TDefinition) => Promise<TEntity>;
  get: (id: string) => Promise<TEntity | null>;
  list: (startIndex?: number, pageSize?: number) => Promise<TEntityListItem[]>;
  update: (id: string, entity: TPartialUpdateDefinition) => Promise<TEntity>;
}

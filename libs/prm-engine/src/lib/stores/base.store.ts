export interface BaseStore<TDefinition, TEntity, TPartialUpdateDefinition> {
  create: (entity: TDefinition) => Promise<TEntity>;
  get: (id: string) => Promise<TEntity | null>;
  update: (id: string, entity: TPartialUpdateDefinition) => Promise<TEntity>;
}

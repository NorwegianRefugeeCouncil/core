export interface BaseStore<T, U, V> {
  create: (entity: T) => Promise<U>;
  get: (id: string) => Promise<U | null>;
  update: (id: string, entity: V) => Promise<U>;
}

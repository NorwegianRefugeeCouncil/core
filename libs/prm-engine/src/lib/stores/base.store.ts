export interface BaseStore<T, U> {
  create: (entity: T) => Promise<U>;
}

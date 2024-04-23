export interface BaseStore<T, U> {
  create: (entity: T) => Promise<U>;
  get: (id: string) => Promise<U | null>;
}

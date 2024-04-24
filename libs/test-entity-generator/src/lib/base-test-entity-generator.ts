export interface BaseTestEntityGenerator<T> {
  generate: (overrides?: Partial<T>) => T;
}

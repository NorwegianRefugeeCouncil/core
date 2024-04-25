export interface BaseTestEntityGenerator<T, U> {
  generateDefinition: (overrides?: Partial<T>) => T;
  generateEntity: (overrides?: Partial<U>) => U;
}

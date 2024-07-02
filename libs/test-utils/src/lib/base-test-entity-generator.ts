export interface BaseTestEntityGenerator<T, U, V> {
  generateDefinition: (overrides?: Partial<T>) => T;
  generateEntity: (overrides?: Partial<U>) => U;
  generateListItem: () => V;
  generateEntityFromDefinition: (overrides?: Partial<T>) => U;
}

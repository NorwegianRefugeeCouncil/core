export class BasePrmStore<T, U> {
  private entityType: string;

  constructor(entityType: string) {
    this.entityType = entityType;
  }

  create(entity: U): Promise<T> {
    throw new Error('Not implemented');
  }
}

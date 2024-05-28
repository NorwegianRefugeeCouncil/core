import {
  Entity,
  EntityDefinition,
  EntityListItem,
  EntityPartialUpdate,
  EntityUpdate,
  EntityFiltering,
  Pagination,
  Sorting,
} from '@nrcno/core-models';

import { BaseStore } from '../stores/base.store';

type GConstructor<T> = new (...args: any[]) => T;

export class BaseService<
  TDefinition,
  TEntity,
  TPartialUpdateDefinition,
  TEntityListItem,
  TEntityFiltering,
> {
  public store: Partial<
    BaseStore<
      TDefinition,
      TEntity,
      TPartialUpdateDefinition,
      TEntityListItem,
      TEntityFiltering
    >
  >;

  constructor(
    store: Partial<
      BaseStore<
        TDefinition,
        TEntity,
        TPartialUpdateDefinition,
        TEntityListItem,
        TEntityFiltering
      >
    >,
  ) {
    this.store = store;
  }
}

export const ListMixin =
  <
    TEntityListItem extends EntityListItem,
    TEntityFiltering extends EntityFiltering,
  >() =>
  <
    TBase extends GConstructor<
      BaseService<any, any, any, TEntityListItem, TEntityFiltering>
    >,
  >(
    Base: TBase,
  ) =>
    class extends Base {
      public list(
        pagination: Pagination,
        sorting: Sorting,
        filter: TEntityFiltering,
      ): Promise<TEntityListItem[]> {
        if (!this.store.list) {
          throw new Error('Method not implemented');
        }
        return this.store.list(pagination, sorting, filter);
      }

      public count(filter: TEntityFiltering): Promise<number> {
        if (!this.store.count) {
          throw new Error('Method not implemented');
        }
        return this.store.count(filter);
      }
    };

export const GetMixin =
  <TEntity extends Entity>() =>
  <TBase extends GConstructor<BaseService<any, TEntity, any, any, any>>>(
    Base: TBase,
  ) =>
    class extends Base {
      public get(id: string): Promise<TEntity | null> {
        if (!this.store.get) {
          throw new Error('Method not implemented');
        }
        return this.store.get(id);
      }
    };

export const CreateMixin =
  <TDefinition extends EntityDefinition, TEntity extends Entity>() =>
  <
    TBase extends GConstructor<
      BaseService<TDefinition, TEntity, any, any, any>
    >,
  >(
    Base: TBase,
  ) =>
    class extends Base {
      public create(entity: TDefinition): Promise<TEntity> {
        if (!this.store.create) {
          throw new Error('Method not implemented');
        }
        return this.store.create(entity);
      }
    };

export const UpdateMixin =
  <
    TEntity extends Entity,
    TUpdate extends EntityUpdate,
    TPartialUpdate extends EntityPartialUpdate,
  >() =>
  <
    TBase extends GConstructor<
      BaseService<any, TEntity, TPartialUpdate, any, any>
    >,
  >(
    Base: TBase,
  ) => {
    abstract class Update extends Base {
      public async update(id: string, entity: TUpdate): Promise<TEntity> {
        if (!this.store.update) {
          throw new Error('Method not implemented');
        }
        const partialUpdate = await this.mapUpdateToPartial(id, entity);
        return this.store.update(id, partialUpdate);
      }

      abstract mapUpdateToPartial(
        id: string,
        update: TUpdate,
      ): Promise<TPartialUpdate>;
    }
    return Update;
  };

export const CRUDMixin =
  <
    TDefinition extends EntityDefinition,
    TEntity extends Entity,
    TUpdate extends EntityUpdate,
    TPartialUpdate extends EntityPartialUpdate,
    TEntityListItem extends EntityListItem,
    TEntityFiltering extends EntityFiltering,
  >() =>
  <
    TBase extends GConstructor<
      BaseService<
        TDefinition,
        TEntity,
        TPartialUpdate,
        TEntityListItem,
        TEntityFiltering
      >
    >,
  >(
    Base: TBase,
  ) =>
    UpdateMixin<TEntity, TUpdate, TPartialUpdate>()(
      CreateMixin<TDefinition, TEntity>()(
        GetMixin<TEntity>()(
          ListMixin<TEntityListItem, TEntityFiltering>()(Base),
        ),
      ),
    );

export const hasListMixin = <T, U>(
  service:
    | {
        list?: T;
        count?: U;
      }
    | undefined,
): service is {
  list: T;
  count: U;
} => {
  return service !== undefined && 'list' in service && 'count' in service;
};

export const hasGetMixin = <T>(
  service: { get?: T } | undefined,
): service is { get: T } => {
  return service !== undefined && 'get' in service;
};

export const hasCreateMixin = <T>(
  service: { create?: T } | undefined,
): service is { create: T } => {
  return service !== undefined && 'create' in service;
};

export const hasUpdateMixin = <T>(
  service: { update?: T } | undefined,
): service is { update: T } => {
  return service !== undefined && 'update' in service;
};

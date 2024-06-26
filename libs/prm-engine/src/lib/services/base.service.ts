/* eslint-disable @typescript-eslint/ban-types */
import { z } from 'zod';
import { Knex } from 'knex';

import {
  Entity,
  EntityDefinition,
  EntityListItem,
  EntityPartialUpdate,
  EntityUpdate,
  EntityFiltering,
  Pagination,
  Sorting,
  EntityType,
  createSortingSchema,
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
  public entityType: EntityType;

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
    entityType: EntityType,
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
    this.entityType = entityType;
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
        sorting: Sorting = createSortingSchema(this.entityType).parse({}),
        filter: TEntityFiltering = {} as TEntityFiltering,
      ): Promise<TEntityListItem[]> {
        if (!this.store.list) {
          throw new Error('Method not implemented');
        }
        return this.store.list(pagination, sorting, filter);
      }

      public count(
        filter: TEntityFiltering = {} as TEntityFiltering,
      ): Promise<number> {
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
  <TDefinition extends EntityDefinition, TEntity extends Entity>(
    definitionSchema: z.ZodType<TDefinition>,
  ) =>
  <
    TBase extends GConstructor<
      BaseService<TDefinition, TEntity, any, any, any>
    >,
  >(
    Base: TBase,
  ) =>
    class extends Base {
      public definitionSchema: z.ZodType<TDefinition> = definitionSchema;

      public create(
        entityDefinition: TDefinition,
        _trx?: Knex.Transaction,
      ): Promise<TEntity | void> {
        if (!this.store.create) {
          throw new Error('Method not implemented');
        }
        return this.store.create(entityDefinition, _trx);
      }

      public validateDefinition(entityDefinition: unknown): TDefinition {
        return this.definitionSchema.parse(entityDefinition);
      }

      public validateAndCreate(
        entityDefinition: unknown,
      ): Promise<TEntity | void> {
        return this.create(this.validateDefinition(entityDefinition));
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
  >(
    definitionSchema: z.ZodType<TDefinition>,
  ) =>
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
      CreateMixin<TDefinition, TEntity>(definitionSchema)(
        GetMixin<TEntity>()(
          ListMixin<TEntityListItem, TEntityFiltering>()(Base),
        ),
      ),
    );

export const hasListMixin = (
  obj: any | undefined,
): obj is { list: Function; count: Function } => {
  return (
    obj !== undefined &&
    typeof obj.list === 'function' &&
    typeof obj.count === 'function'
  );
};

export const hasGetMixin = (obj: any | undefined): obj is { get: Function } => {
  return obj !== undefined && typeof obj.get === 'function';
};

export const hasCreateMixin = (
  obj: any | undefined,
): obj is { create: Function } => {
  return obj !== undefined && typeof obj.create === 'function';
};

export const hasUpdateMixin = (
  obj: any | undefined,
): obj is { update: Function } => {
  return obj !== undefined && typeof obj.update === 'function';
};

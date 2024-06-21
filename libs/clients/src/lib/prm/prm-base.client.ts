/* eslint-disable @typescript-eslint/ban-types */
import { AxiosInstance } from 'axios';
import { z } from 'zod';

import {
  Entity,
  EntityDefinition,
  EntityFiltering,
  EntityListItem,
  EntityType,
  PaginatedResponse,
  Pagination,
  Sorting,
  createPaginatedResponseSchema,
  createSortingSchema,
  getEntityListItemSchema,
  getEntitySchema,
} from '@nrcno/core-models';

import { BaseClient } from '../base.client';

type GConstructor<T> = new (...args: any[]) => T;

export const BasePrmClient = (entityType: EntityType) =>
  class extends BaseClient {
    public entityType: EntityType = entityType;

    constructor(axiosInstance: AxiosInstance) {
      super(axiosInstance);
    }
  };

type TBasePrmClient = InstanceType<ReturnType<typeof BasePrmClient>>;

export const CreateMixin =
  <TEntity extends Entity, TEntityDefinition extends EntityDefinition>(
    definitionSchema: z.ZodType<TEntityDefinition>,
  ) =>
  <TBase extends GConstructor<TBasePrmClient>>(Base: TBase) => {
    return class extends Base {
      public definitionSchema: z.ZodType<TEntityDefinition> = definitionSchema;

      public async create(entity: TEntityDefinition): Promise<TEntity> {
        const entitySchema = getEntitySchema(this.entityType);
        const response = await this.post(`/prm/${this.entityType}`, entity);
        return entitySchema.parse(response.data) as TEntity;
      }

      public validateDefinition(entityDefinition: unknown): TEntityDefinition {
        return this.definitionSchema.parse(entityDefinition);
      }

      public validateAndCreate(entityDefinition: unknown): Promise<TEntity> {
        return this.create(this.validateDefinition(entityDefinition));
      }
    };
  };

export const ReadMixin =
  <TEntity extends Entity>() =>
  <TBase extends GConstructor<TBasePrmClient>>(Base: TBase) => {
    return class extends Base {
      public async read(id: string): Promise<TEntity> {
        const entitySchema = getEntitySchema(this.entityType);
        const response = await this.get(`/prm/${this.entityType}/${id}`);
        return entitySchema.parse(response.data) as TEntity;
      }
    };
  };

export const UpdateMixin =
  <TEntity extends Entity>() =>
  <TBase extends GConstructor<TBasePrmClient>>(Base: TBase) => {
    return class extends Base {
      public async update(
        id: string,
        entity: Partial<Entity>,
      ): Promise<TEntity> {
        const entitySchema = getEntitySchema(this.entityType);
        const response = await this.put(
          `/prm/${this.entityType}/${id}`,
          entity,
        );
        return entitySchema.parse(response.data) as TEntity;
      }
    };
  };

export const ListMixin =
  <TEntityListItem extends EntityListItem>() =>
  <TBase extends GConstructor<TBasePrmClient>>(Base: TBase) => {
    return class extends Base {
      public async list(
        pagination: Pagination,
        sorting: Sorting = createSortingSchema(this.entityType).parse({}),
        filters?: EntityFiltering,
      ): Promise<PaginatedResponse<TEntityListItem>> {
        const entityListPaginationSchema = createPaginatedResponseSchema(
          getEntityListItemSchema(this.entityType),
        );
        const response = await this.get(`/prm/${this.entityType}`, {
          params: { ...pagination, ...filters, ...sorting },
        });
        return entityListPaginationSchema.parse(
          response.data as TEntityListItem,
        ) as PaginatedResponse<TEntityListItem>;
      }
    };
  };

export const CRUDMixin =
  <
    TEntity extends Entity,
    TEntityDefinition extends EntityDefinition,
    TEntityListItem extends EntityListItem,
  >(
    definitionSchema: z.ZodType<TEntityDefinition>,
  ) =>
  <TBase extends GConstructor<TBasePrmClient>>(Base: TBase) =>
    ListMixin<TEntityListItem>()(
      UpdateMixin<TEntity>()(
        ReadMixin<TEntity>()(
          CreateMixin<TEntity, TEntityDefinition>(definitionSchema)(Base),
        ),
      ),
    );

export const hasListMixin = (
  obj: any | undefined,
): obj is { list: Function; count: Function } => {
  return obj !== undefined && typeof obj.list === 'function';
};

export const hasReadMixin = (
  obj: any | undefined,
): obj is { read: Function } => {
  return obj !== undefined && typeof obj.read === 'function';
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

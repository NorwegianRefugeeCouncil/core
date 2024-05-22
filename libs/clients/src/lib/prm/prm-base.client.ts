import { AxiosInstance } from 'axios';

import {
  Entity,
  EntityDefinition,
  EntityListItem,
  EntityType,
  PaginatedResponse,
  Pagination,
  createPaginatedResponseSchema,
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
  <TEntity extends Entity, TEntityDefinition extends EntityDefinition>() =>
  <TBase extends GConstructor<TBasePrmClient>>(Base: TBase) => {
    return class extends Base {
      public async create(entity: TEntityDefinition): Promise<TEntity> {
        const entitySchema = getEntitySchema(this.entityType);
        const response = await this.post(`/prm/${this.entityType}`, entity);
        return entitySchema.parse(response.data) as TEntity;
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
      ): Promise<PaginatedResponse<TEntityListItem>> {
        const entityListPaginationSchema = createPaginatedResponseSchema(
          getEntityListItemSchema(this.entityType),
        );
        const response = await this.get(`/prm/${this.entityType}`, {
          params: pagination,
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
  >() =>
  <TBase extends GConstructor<TBasePrmClient>>(Base: TBase) =>
    ListMixin<TEntityListItem>()(
      UpdateMixin<TEntity>()(
        ReadMixin<TEntity>()(CreateMixin<TEntity, TEntityDefinition>()(Base)),
      ),
    );

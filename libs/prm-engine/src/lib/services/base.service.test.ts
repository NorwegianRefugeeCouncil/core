import {
  EntityType,
  IndividualDefinitionSchema,
  IndividualUpdateSchema,
  SortingDirection,
} from '@nrcno/core-models';

import { CreateMixin, GetMixin, ListMixin, UpdateMixin } from './base.service';
import { createTrx } from './utils';

jest.mock('./utils', () => ({
  createTrx: jest.fn().mockResolvedValue({
    rollback: jest.fn(),
    commit: jest.fn(),
  }),
}));

describe('BaseService', () => {
  describe('UpdateMixin', () => {
    it('should update an entity', async () => {
      const storeMock = {
        update: jest.fn().mockResolvedValue({
          updated: true,
        }),
      };

      const mapUpdateToPartialMock = jest.fn().mockResolvedValue({
        mapped: true,
      });

      const ServiceWithUpdateMixin = class Foo extends UpdateMixin<
        any,
        any,
        any
      >(IndividualUpdateSchema)(
        class {
          public entityType = EntityType.Individual;
          public store = storeMock;
        },
      ) {
        mapUpdateToPartial(id: string, update: any) {
          return mapUpdateToPartialMock(id, update);
        }
      };

      const service = new ServiceWithUpdateMixin();

      const id = '123';
      const update = {
        updated: false,
        mapped: false,
      };

      const result = await service.update(id, update);

      expect(result).toEqual({
        updated: true,
      });
      expect(mapUpdateToPartialMock).toHaveBeenCalledWith(id, update);
      expect(storeMock.update).toHaveBeenCalledWith(id, {
        mapped: true,
      });
    });
  });

  describe('GetMixin', () => {
    it('should get an entity', async () => {
      const storeMock = {
        get: jest.fn().mockResolvedValue({
          id: '123',
        }),
      };

      const ServiceWithGetMixin = class Foo extends GetMixin<any>()(
        class {
          public entityType = EntityType.Individual;
          public store = storeMock;
        },
      ) {};

      const service = new ServiceWithGetMixin();

      const id = '123';

      const result = await service.get(id);

      expect(result).toEqual({
        id: '123',
      });
      expect(storeMock.get).toHaveBeenCalledWith(id);
    });
  });

  describe('ListMixin', () => {
    it('should list entities', async () => {
      const storeMock = {
        list: jest.fn().mockResolvedValue([
          {
            id: '123',
          },
        ]),
      };

      const ServiceWithListMixin = class Foo extends ListMixin<any, any>()(
        class {
          public entityType = EntityType.Individual;
          public store = storeMock;
        },
      ) {};

      const service = new ServiceWithListMixin();

      const pagination = {
        startIndex: 0,
        pageSize: 50,
      };

      const sorting = {
        sort: 'field',
        direction: SortingDirection.Asc,
      };

      const filter = {
        field: 'value',
      };

      const result = await service.list(pagination, sorting, filter);

      expect(result).toEqual([
        {
          id: '123',
        },
      ]);
      expect(storeMock.list).toHaveBeenCalledWith(pagination, sorting, filter);
    });

    it('should count entities', async () => {
      const storeMock = {
        count: jest.fn().mockResolvedValue(123),
      };

      const ServiceWithListMixin = class Foo extends ListMixin<any, any>()(
        class {
          public entityType = EntityType.Individual;
          public store = storeMock;
        },
      ) {};

      const filter = {
        field: 'value',
      };

      const service = new ServiceWithListMixin();

      const result = await service.count(filter);

      expect(result).toBe(123);
      expect(storeMock.count).toHaveBeenCalledWith(filter);
    });
  });

  describe('CreateMixin', () => {
    it('should create an entity', async () => {
      const storeMock = {
        create: jest.fn().mockResolvedValue({
          id: '123',
          value: 'foo',
        }),
      };

      const ServiceWithCreateMixin = class Foo extends CreateMixin<any, any>(
        IndividualDefinitionSchema,
      )(
        class {
          public entityType = EntityType.Individual;
          public store = storeMock;
        },
      ) {};

      const service = new ServiceWithCreateMixin();

      const entity = {
        value: 'foo',
      };
      const trx = await createTrx();

      const result = await service.create(entity, trx);

      expect(result).toEqual({
        id: '123',
        value: 'foo',
      });
      expect(storeMock.create).toHaveBeenCalledWith(entity, trx);
    });
  });
});

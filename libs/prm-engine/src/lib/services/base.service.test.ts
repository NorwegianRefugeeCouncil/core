import { CreateMixin, GetMixin, ListMixin, UpdateMixin } from './base.service';

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
      >()(
        class {
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

      const ServiceWithListMixin = class Foo extends ListMixin<any>()(
        class {
          public store = storeMock;
        },
      ) {};

      const service = new ServiceWithListMixin();

      const pagination = {
        startIndex: 0,
        pageSize: 50,
      };

      const result = await service.list(pagination);

      expect(result).toEqual([
        {
          id: '123',
        },
      ]);
      expect(storeMock.list).toHaveBeenCalledWith(pagination);
    });

    it('should count entities', async () => {
      const storeMock = {
        count: jest.fn().mockResolvedValue(123),
      };

      const ServiceWithListMixin = class Foo extends ListMixin<any>()(
        class {
          public store = storeMock;
        },
      ) {};

      const service = new ServiceWithListMixin();

      const result = await service.count();

      expect(result).toBe(123);
      expect(storeMock.count).toHaveBeenCalled();
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

      const ServiceWithCreateMixin = class Foo extends CreateMixin<any, any>()(
        class {
          public store = storeMock;
        },
      ) {};

      const service = new ServiceWithCreateMixin();

      const entity = {
        value: 'foo',
      };

      const result = await service.create(entity);

      expect(result).toEqual({
        id: '123',
        value: 'foo',
      });
      expect(storeMock.create).toHaveBeenCalledWith(entity);
    });
  });
});

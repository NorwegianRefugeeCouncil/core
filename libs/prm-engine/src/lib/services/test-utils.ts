import { EntityType } from '@nrcno/core-models';
import { getListItemGenerator } from '@nrcno/core-test-utils';

export const buildListTests = (
  entityType: EntityType,
  Service: any,
  Store: any,
) => {
  describe('list', () => {
    it('should call the store list method', async () => {
      const listItemGenerator = getListItemGenerator(entityType);
      const entityList = [
        listItemGenerator(),
        listItemGenerator(),
        listItemGenerator(),
      ];

      // eslint-disable-next-line no-param-reassign
      Store.list = jest.fn().mockResolvedValueOnce(entityList);

      const service = new Service();

      const result = await service.list(
        {
          startIndex: 0,
          pageSize: 10,
        },
        {
          sort: 'field',
          direction: 'asc',
        },
        {
          field: 'value',
        },
      );

      expect(Store.list).toHaveBeenCalledWith(
        {
          startIndex: 0,
          pageSize: 10,
        },
        {
          sort: 'field',
          direction: 'asc',
        },
        {
          field: 'value',
        },
      );
      expect(result).toEqual(entityList);
    });
  });

  it('should throw an error if the store list method fails', async () => {
    // eslint-disable-next-line no-param-reassign
    Store.list = jest
      .fn()
      .mockRejectedValueOnce(new Error('Failed to list entities'));

    const service = new Service();

    await expect(
      service.list(
        { startIndex: 0, pageSize: 10 },
        { sort: 'field', direction: 'asc' },
        { field: 'value' },
      ),
    ).rejects.toThrow('Failed to list entities');

    expect(Store.list).toHaveBeenCalledWith(
      {
        startIndex: 0,
        pageSize: 10,
      },
      {
        sort: 'field',
        direction: 'asc',
      },
      {
        field: 'value',
      },
    );
  });
};

export const buildCountTests = (
  entityType: EntityType,
  Service: any,
  Store: any,
) => {
  describe('count', () => {
    it('should call the store count method', async () => {
      // eslint-disable-next-line no-param-reassign
      Store.count = jest.fn().mockResolvedValueOnce(3);

      const service = new Service();

      const result = await service.count();

      expect(Store.count).toHaveBeenCalled();
      expect(result).toEqual(3);
    });

    it('should throw an error if the store count method fails', async () => {
      // eslint-disable-next-line no-param-reassign
      Store.count = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed to count entities'));

      const service = new Service();

      await expect(service.count()).rejects.toThrow('Failed to count entities');

      expect(Store.count).toHaveBeenCalled();
    });
  });
};

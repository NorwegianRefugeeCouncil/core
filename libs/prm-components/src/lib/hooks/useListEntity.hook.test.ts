import { vi } from 'vitest';
import { act, renderHook } from '@testing-library/react-hooks';
import { EntityFiltering, Pagination } from '@nrcno/core-models';

import { useListEntity } from './useListEntity.hook';
import { SubmitStatus } from './useApiReducer.hook';

const pagination: Pagination = {
  startIndex: 0,
  pageSize: 100,
};

const filters: EntityFiltering = {
  firstName: 'bob',
};

describe('useListEntity', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      list: vi.fn(),
    };
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useListEntity(mockClient));
    expect(result.current.listEntities).toBeDefined();
    expect(result.current.status).toBe(SubmitStatus.IDLE);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  test('should update status to "SUBMITTING" while loading an entity list', async () => {
    const { result } = renderHook(() => useListEntity(mockClient));
    const state = result.current;
    state.listEntities(pagination, filters);
    expect(result.current.status).toBe(SubmitStatus.SUBMITTING);
  });

  it('should update status to "SUCCESS" and set data when entity list is loaded', async () => {
    const mockResponse = {
      startIndex: 0,
      pageSize: 100,
      totalCount: 1,
      items: [
        {
          id: '123',
          name: 'Test Entity',
        },
      ],
    };

    mockClient.list.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useListEntity(mockClient));

    await act(async () => {
      await result.current.listEntities(pagination, filters);
    });

    expect(mockClient.list).toHaveBeenCalledWith(pagination, filters);
    expect(result.current.status).toBe(SubmitStatus.SUCCESS);
    expect(result.current.data).toEqual(mockResponse);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle load entity list error', async () => {
    const mockError = new Error('Failed to load entity');

    mockClient.list.mockRejectedValue(mockError);

    const { result } = renderHook(() => useListEntity(mockClient));

    await act(async () => {
      await result.current.listEntities(pagination, filters);
    });

    expect(mockClient.list).toHaveBeenCalledWith(pagination, filters);
    expect(result.current.status).toBe(SubmitStatus.ERROR);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(mockError);
  });
});

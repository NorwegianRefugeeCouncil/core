import { vi } from 'vitest';
import { act, renderHook } from '@testing-library/react-hooks';

import { useEditEntity } from './useEditEntity.hook';
import { SubmitStatus } from './useApiReducer.hook';

describe('useEditEntity', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      update: vi.fn(),
    };
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEditEntity(mockClient));
    expect(result.current.onEditEntity).toBeDefined();
    expect(result.current.status).toBe(SubmitStatus.IDLE);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  test('should update status to "SUBMITTING" while loading an entity', async () => {
    const { result } = renderHook(() => useEditEntity(mockClient));
    const entityId = '123';
    const mockEntity = {
      id: entityId,
      name: 'Test Entity',
    };
    result.current.onEditEntity(entityId, mockEntity);
    expect(result.current.status).toBe(SubmitStatus.SUBMITTING);
  });

  it('should update status to "SUCCESS" and set data when entity is loaded', async () => {
    const entityId = '123';
    const mockEntity = { id: entityId, name: 'Test Entity' };

    mockClient.update.mockResolvedValue(mockEntity);

    const { result } = renderHook(() => useEditEntity(mockClient));

    await act(async () => {
      await result.current.onEditEntity(entityId, mockEntity);
    });

    expect(mockClient.update).toHaveBeenCalledWith(entityId, mockEntity);
    expect(result.current.status).toBe(SubmitStatus.SUCCESS);
    expect(result.current.data).toEqual(mockEntity);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle load entity error', async () => {
    const entityId = '123';
    const mockEntity = { id: entityId, name: 'Test Entity' };
    const mockError = new Error('Failed to load entity');

    mockClient.update.mockRejectedValue(mockError);

    const { result } = renderHook(() => useEditEntity(mockClient));

    await act(async () => {
      await result.current.onEditEntity(entityId, mockEntity);
    });

    expect(mockClient.update).toHaveBeenCalledWith(entityId, mockEntity);
    expect(result.current.status).toBe(SubmitStatus.ERROR);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(mockError);
  });
});

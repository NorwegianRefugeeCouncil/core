import { vi } from 'vitest';
import { act, renderHook } from '@testing-library/react-hooks';

import { useReadEntity } from './useReadEntity.hook';
import { SubmitStatus } from './useApiReducer.hook';

describe('useReadEntity', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      read: vi.fn(),
    };
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useReadEntity(mockClient));
    expect(result.current.loadEntity).toBeDefined();
    expect(result.current.status).toBe(SubmitStatus.IDLE);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  test('should update status to "SUBMITTING" while loading an entity', async () => {
    const { result } = renderHook(() => useReadEntity(mockClient));
    const state = result.current;
    const entityId = '123';
    state.loadEntity(entityId);
    expect(result.current.status).toBe(SubmitStatus.SUBMITTING);
  });

  it('should update status to "SUCCESS" and set data when entity is loaded', async () => {
    const entityId = '123';
    const mockEntity = { id: entityId, name: 'Test Entity' };

    mockClient.read.mockResolvedValue(mockEntity);

    const { result } = renderHook(() => useReadEntity(mockClient));

    await act(async () => {
      await result.current.loadEntity(entityId);
    });

    expect(mockClient.read).toHaveBeenCalledWith(entityId);
    expect(result.current.status).toBe(SubmitStatus.SUCCESS);
    expect(result.current.data).toEqual(mockEntity);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle load entity error', async () => {
    const entityId = '123';
    const mockError = new Error('Failed to load entity');

    mockClient.read.mockRejectedValue(mockError);

    const { result } = renderHook(() => useReadEntity(mockClient));

    await act(async () => {
      await result.current.loadEntity(entityId);
    });

    expect(mockClient.read).toHaveBeenCalledWith(entityId);
    expect(result.current.status).toBe(SubmitStatus.ERROR);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(mockError);
  });
});

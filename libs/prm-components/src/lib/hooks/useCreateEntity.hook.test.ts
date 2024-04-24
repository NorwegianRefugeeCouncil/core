import { renderHook, act } from '@testing-library/react-hooks';
import { PrmClient } from '@nrcno/core-clients';
import { EntityType } from '@nrcno/core-models';
import { vi, Mock } from 'vitest';

import { SubmitStatus } from '../types';

import { useCreateEntity } from './useCreateEntity.hook';

describe('useCreateEntity', () => {
  let participantClient: PrmClient[EntityType.Participant];

  beforeEach(() => {
    participantClient = {
      create: vi.fn(),
    } as unknown as PrmClient[EntityType.Participant];
  });

  test('should initialize with default state', () => {
    const { result } = renderHook(() => useCreateEntity(participantClient));
    const { onCreateEntity, status, data, error } = result.current;

    expect(typeof onCreateEntity).toBe('function');
    expect(status).toBe(SubmitStatus.IDLE);
    expect(data).toBeUndefined();
    expect(error).toBeUndefined();
  });

  test('should call onCreateEntity with the correct entity definition', async () => {
    const { result } = renderHook(() => useCreateEntity(participantClient));
    const { onCreateEntity } = result.current;

    const entityDefinition = { name: 'John Doe', age: 30 };
    await act(async () => {
      await onCreateEntity(entityDefinition);
    });

    expect(participantClient.create).toHaveBeenCalledWith(entityDefinition);
  });

  test('should update status to "SUBMITTING" while creating entity', async () => {
    const { result } = renderHook(() => useCreateEntity(participantClient));
    const { onCreateEntity } = result.current;
    const entityDefinition = { name: 'John Doe', age: 30 };
    onCreateEntity(entityDefinition);

    expect(result.current.status).toBe(SubmitStatus.SUBMITTING);
  });

  test('should update status to "SUCCESS" and set data when entity creation is successful', async () => {
    const mockCreatedEntity = { id: '1', name: 'John Doe', age: 30 };

    (participantClient.create as Mock).mockResolvedValueOnce(mockCreatedEntity);

    const { result } = renderHook(() => useCreateEntity(participantClient));
    const { onCreateEntity } = result.current;

    const entityDefinition = { name: 'John Doe', age: 30 };
    await act(async () => {
      await onCreateEntity(entityDefinition);
    });

    expect(result.current.status).toBe(SubmitStatus.SUCCESS);
    expect(result.current.data).toEqual(mockCreatedEntity);
  });

  test('should update status to "REJECTED" and set error when entity creation fails', async () => {
    const mockError = new Error('An error occurred');

    (participantClient.create as Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCreateEntity(participantClient));
    const { onCreateEntity } = result.current;

    const entityDefinition = { name: 'John Doe', age: 30 };
    await act(async () => {
      await onCreateEntity(entityDefinition);
    });

    expect(result.current.status).toBe(SubmitStatus.ERROR);
    expect(result.current.error).toEqual(mockError);
  });
});

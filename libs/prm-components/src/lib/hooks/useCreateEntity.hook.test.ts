import { renderHook, act } from '@testing-library/react-hooks';
import { PrmClient } from '@nrcno/core-clients';
import { EntityType } from '@nrcno/core-models';
import { vi, Mock } from 'vitest';
import { IndividualGenerator } from '@nrcno/core-test-utils';

import { SubmitStatus } from './useApiReducer.hook';
import { useCreateEntity } from './useCreateEntity.hook';

describe('useCreateEntity', () => {
  let individualClient: PrmClient[EntityType.Individual];

  beforeEach(() => {
    individualClient = {
      create: vi.fn(),
    } as unknown as PrmClient[EntityType.Individual];
  });

  test('should initialize with default state', () => {
    const { result } = renderHook(() => useCreateEntity(individualClient));
    const { onCreateEntity, status, data, error } = result.current;

    expect(typeof onCreateEntity).toBe('function');
    expect(status).toBe(SubmitStatus.IDLE);
    expect(data).toBeUndefined();
    expect(error).toBeUndefined();
  });

  test('should call onCreateEntity with the correct entity definition', async () => {
    const { result } = renderHook(() => useCreateEntity(individualClient));
    const { onCreateEntity } = result.current;

    const entityDefinition = IndividualGenerator.generateDefinition();
    await act(async () => {
      await onCreateEntity(entityDefinition);
    });

    expect(individualClient.create).toHaveBeenCalledWith(entityDefinition);
  });

  test('should update status to "SUBMITTING" while creating entity', async () => {
    const { result } = renderHook(() => useCreateEntity(individualClient));
    const { onCreateEntity } = result.current;
    const entityDefinition = IndividualGenerator.generateDefinition();
    onCreateEntity(entityDefinition);

    expect(result.current.status).toBe(SubmitStatus.SUBMITTING);
  });

  test('should update status to "SUCCESS" and set data when entity creation is successful', async () => {
    const mockCreatedEntity = IndividualGenerator.generateEntity();

    (individualClient.create as Mock).mockResolvedValueOnce(mockCreatedEntity);

    const { result } = renderHook(() => useCreateEntity(individualClient));
    const { onCreateEntity } = result.current;

    const entityDefinition = IndividualGenerator.generateDefinition();
    await act(async () => {
      await onCreateEntity(entityDefinition);
    });

    expect(result.current.status).toBe(SubmitStatus.SUCCESS);
    expect(result.current.data).toEqual(mockCreatedEntity);
  });

  test('should update status to "REJECTED" and set error when entity creation fails', async () => {
    const mockError = new Error('An error occurred');

    (individualClient.create as Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useCreateEntity(individualClient));
    const { onCreateEntity } = result.current;

    const entityDefinition = IndividualGenerator.generateDefinition();
    await act(async () => {
      try {
        await onCreateEntity(entityDefinition);
      } catch (e) {
        expect(e).toEqual(mockError);
      }
    });

    expect(result.current.status).toBe(SubmitStatus.ERROR);
    expect(result.current.error).toEqual(mockError);
  });
});

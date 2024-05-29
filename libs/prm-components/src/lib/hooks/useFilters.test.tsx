import { renderHook, act } from '@testing-library/react-hooks';
import { MemoryRouter } from 'react-router-dom';
import { EntityType } from '@nrcno/core-models';
import { Mock } from 'vitest';

import { PrmContextData, usePrmContext } from '../prm.context';

import { useFilters } from './useFilters';
import { SubmitStatus } from './useApiReducer.hook';

const renderHookOptions = {
  wrapper: ({ children }: { children: any }) => (
    <MemoryRouter>{children}</MemoryRouter>
  ),
};

vi.mock('../prm.context', () => ({
  usePrmContext: vi.fn(),
}));

describe('useFilters', () => {
  const prmContextData: PrmContextData = {
    entityType: EntityType.Participant,
    entityId: '1234',
    create: {
      onCreateEntity: vi.fn(),
      reset: vi.fn(),
      status: SubmitStatus.IDLE,
      data: undefined,
      error: undefined,
    },
    read: {
      loadEntity: vi.fn(),
      reset: vi.fn(),
      status: SubmitStatus.IDLE,
      data: undefined,
      error: undefined,
    },
    edit: {
      onEditEntity: vi.fn(),
      reset: vi.fn(),
      status: SubmitStatus.IDLE,
      data: undefined,
      error: undefined,
    },
    list: {
      listEntities: vi.fn(),
      reset: vi.fn(),
      status: SubmitStatus.IDLE,
      data: undefined,
      error: undefined,
    },
  };
  beforeEach(() => {
    vi.clearAllMocks();
    (usePrmContext as Mock).mockReturnValue(prmContextData);
  });
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFilters(), renderHookOptions);

    expect(result.current.filters).toEqual({});
  });

  it('should apply defined filter values', () => {
    const { result } = renderHook(() => useFilters(), renderHookOptions);

    act(() => {
      result.current.applyFilters({ firstName: 'John', middleName: undefined });
    });

    expect(result.current.filters).toEqual({ firstName: 'John' });
  });

  it('should delete individual filters', () => {
    const { result } = renderHook(() => useFilters(), renderHookOptions);

    act(() => {
      result.current.applyFilters({ firstName: 'John', middleName: 'Bob' });
    });

    expect(result.current.filters).toEqual({
      firstName: 'John',
      middleName: 'Bob',
    });
    act(() => {
      result.current.deleteFilter('firstName');
    });

    expect(result.current.filters).toEqual({ middleName: 'Bob' });
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useFilters(), renderHookOptions);

    act(() => {
      result.current.applyFilters({ firstName: 'John', middleName: 'Bob' });
    });

    expect(result.current.filters).toEqual({
      firstName: 'John',
      middleName: 'Bob',
    });
    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filters).toEqual({});
  });
});

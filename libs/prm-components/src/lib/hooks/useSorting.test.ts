import { renderHook, act } from '@testing-library/react-hooks';
import { SortingDirection } from '@nrcno/core-models';

import { useSorting } from './useSorting';

describe('useSorting', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSorting());

    expect(result.current.sorting.sort).toBe('id');
    expect(result.current.sorting.direction).toBe(SortingDirection.Asc);
  });

  it('should update sorting values', () => {
    const { result } = renderHook(() => useSorting());
    expect(result.current.sorting.sort).toBe('id');
    expect(result.current.sorting.direction).toBe(SortingDirection.Asc);

    act(() => {
      result.current.updateSorting({
        sort: 'firstName',
        direction: SortingDirection.Desc,
      });
    });

    expect(result.current.sorting.sort).toBe('firstName');
    expect(result.current.sorting.direction).toBe(SortingDirection.Asc);

    act(() => {
      result.current.updateSorting({
        sort: 'firstName',
        direction: SortingDirection.Desc,
      });
    });

    expect(result.current.sorting.sort).toBe('firstName');
    expect(result.current.sorting.direction).toBe(SortingDirection.Desc);
  });
});

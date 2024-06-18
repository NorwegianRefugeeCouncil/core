import { renderHook, act } from '@testing-library/react-hooks';
import { SortingDirection } from '@nrcno/core-models';

import { useSorting } from './useSorting.hook';

describe('useSorting', () => {
  it('should initialize with unset default values', () => {
    const { result } = renderHook(() => useSorting(null));

    expect(result.current.sorting.sort).toBe('id');
    expect(result.current.sorting.direction).toBe(SortingDirection.Asc);
  });

  it('should initialize with set default values', () => {
    const { result } = renderHook(() =>
      useSorting({
        sort: 'firstName',
        direction: SortingDirection.Desc,
      }),
    );

    expect(result.current.sorting.sort).toBe('firstName');
    expect(result.current.sorting.direction).toBe(SortingDirection.Desc);
  });

  it('should update sorting values', () => {
    const { result } = renderHook(() => useSorting(null));
    expect(result.current.sorting.sort).toBe('id');
    expect(result.current.sorting.direction).toBe(SortingDirection.Asc);

    act(() => {
      result.current.updateSorting({
        sort: 'firstName',
        direction: SortingDirection.Asc,
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

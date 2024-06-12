import { useState } from 'react';
import { Sorting, SortingDirection } from '@nrcno/core-models';

export interface UseSorting {
  sorting: Sorting;
  updateSorting: (sorting: Sorting) => void;
  isCurrentSort: (field: Sorting['sort']) => boolean;
}

export const useSorting = (): UseSorting => {
  const [sorting, setSortingInternal] = useState<Sorting>({
    direction: SortingDirection.Asc,
    sort: 'id',
  });
  const [sortModeIndex, setSortModeIndex] = useState<number>(0);

  const sortModes = [
    SortingDirection.Asc,
    SortingDirection.Desc,
    SortingDirection.None,
  ];

  const updateSorting = (s: Sorting) => {
    if (s.sort === sorting.sort) {
      const inc = sortModeIndex + 1;
      setSortingInternal({
        sort: s.sort,
        direction: sortModes[inc % sortModes.length],
      });
      setSortModeIndex(inc);
    } else {
      setSortingInternal({
        sort: s.sort,
        direction: SortingDirection.Asc,
      });
      setSortModeIndex(0);
    }
  };

  const isCurrentSort = (field: Sorting['sort']) => {
    return sorting.sort === field;
  };

  return {
    sorting,
    updateSorting,
    isCurrentSort,
  };
};

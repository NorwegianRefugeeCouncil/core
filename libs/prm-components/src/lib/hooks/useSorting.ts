import { useState } from 'react';
import { Sorting, SortingDirection } from '@nrcno/core-models';

export enum SortModes {
  Asc = SortingDirection.Asc,
  Desc = SortingDirection.Desc,
  None = 'none',
}
export interface UseSorting {
  sorting: Sorting;
  updateSorting: (sorting: Sorting) => void;
  isCurrentSort: (field: Sorting['sort']) => boolean;
}

export const useSorting = (): UseSorting => {
  const [sortMode, setSortMode] = useState<Sorting>({
    direction: SortingDirection.Asc,
    sort: 'id',
  });
  // const [sorting, setSorting] = useState<Sorting>({
  //   direction: SortingDirection.Asc,
  //   sort: 'id',
  // });
  const [sortModeIndex, setSortModeIndex] = useState<number>(0);

  const sortModes = [SortModes.Asc, SortModes.Desc, SortModes.None];

  const updateSorting = (s: Sorting) => {
    if (s.sort === sortMode.sort) {
      const inc = sortModeIndex + 1;
      setSortMode({
        sort: s.sort,
        direction: sortModes[inc % sortModes.length],
      });
      setSortModeIndex(inc);
    } else {
      setSortMode({
        sort: s.sort,
        direction: SortingDirection.Asc,
      });
      setSortModeIndex(0);
    }
  };

  const isCurrentSort = (field: Sorting['sort']) => {
    return sortMode.sort === field;
  };

  return {
    sorting: sortMode,
    updateSorting,
    isCurrentSort,
  };
};

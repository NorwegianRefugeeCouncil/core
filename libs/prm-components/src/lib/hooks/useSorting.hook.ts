import { useState } from 'react';
import { Sorting, SortingDirection } from '@nrcno/core-models';

export interface UseSorting {
  sorting: Sorting;
  updateSorting: (sorting: Sorting) => void;
  isCurrentSort: (field: Sorting['sort']) => boolean;
}

export const useSorting = (defaultSort: Sorting | null): UseSorting => {
  const [sorting, setSorting] = useState<Sorting>(
    defaultSort || {
      sort: 'id', // common sort field across all entities
      direction: SortingDirection.Asc,
    },
  );

  const isCurrentSort = (field: Sorting['sort']) => {
    return sorting.sort === field;
  };

  return {
    sorting,
    updateSorting: setSorting,
    isCurrentSort,
  };
};

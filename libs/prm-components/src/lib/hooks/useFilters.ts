import { EntityFiltering, getEntityFilteringSchema } from '@nrcno/core-models';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { usePrmContext } from '../prm.context';

export interface UseFilters {
  applyFilters: (filters: EntityFiltering) => void;
  clearFilters: () => void;
  deleteFilter: (filter: string) => void;
  filters: EntityFiltering | null;
}

export const useFilters = (): UseFilters => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<EntityFiltering | null>(null);
  const { entityType } = usePrmContext();

  const parseFilters = (filters: EntityFiltering) => {
    return Object.keys(filters).reduce((acc, p) => {
      if (filters[p as keyof EntityFiltering] !== undefined) {
        return {
          ...acc,
          [p]: filters[p as keyof EntityFiltering],
        };
      }
      return acc;
    }, {});
  };

  const applyFilters = (filters: EntityFiltering) => {
    const params = parseFilters(filters);
    setFilters(params);
    setSearchParams(params);
  };

  const parseParams = (params: URLSearchParams) => {
    if (entityType) {
      const schema = getEntityFilteringSchema(entityType);
      const f = schema.safeParse(Object.fromEntries(params));
      if (f.success) {
        applyFilters(f.data);
      }
    }
  };

  useEffect(() => {
    parseParams(searchParams);

    return () => {
      setFilters({});
      setSearchParams({});
    };
  }, [JSON.stringify(searchParams)]);

  const deleteFilter = (filter: string) => {
    const filters = searchParams;
    filters.delete(filter);
    setSearchParams(filters);
    parseParams(filters);
  };

  const clearFilters = () => {
    setSearchParams({});
    setFilters({});
  };

  return {
    applyFilters,
    clearFilters,
    deleteFilter,
    filters,
  };
};

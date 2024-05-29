import { EntityFiltering, getEntityFilteringSchema } from '@nrcno/core-models';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { usePrmContext } from '../prm.context';

export interface UseFilters {
  applyFilters: (filters: EntityFiltering) => void;
  clearFilters: () => void;
  deleteFilter: (filter: string) => void;
  filters: EntityFiltering;
}

export const useFilters = (): UseFilters => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<EntityFiltering>({});
  const { entityType } = usePrmContext();

  useEffect(() => {
    parseParams(searchParams);
  }, [JSON.stringify(searchParams)]);

  const applyFilters = (filters: EntityFiltering) => {
    const params = filters;
    Object.keys(params).forEach((p) => {
      if (filters[p as keyof EntityFiltering] === undefined) {
        delete params[p as keyof EntityFiltering];
      }
    });
    setFilters(filters);
    setSearchParams(params as URLSearchParams);
  };

  const parseParams = (params: URLSearchParams) => {
    if (entityType) {
      const schema = getEntityFilteringSchema(entityType);
      const f = schema.safeParse(Object.fromEntries(params));
      if (f.success) {
        setFilters(f.data);
      }
    }
  };

  const deleteFilter = (filter: string) => {
    searchParams.delete(filter);
    setSearchParams(searchParams);
    parseParams(searchParams);
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

import { EntityFiltering, EntityFilteringSchema } from '@nrcno/core-models';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface UseFilters {
  applyFilters: (filters: EntityFiltering) => void;
  clearFilters: () => void;
  deleteFilter: (filter: string) => void;
  filters: EntityFiltering;
}

export const useFilters = (): UseFilters => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<EntityFiltering>({});

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
    const f = EntityFilteringSchema.safeParse(Object.fromEntries(params));
    if (f.success) {
      setFilters(f.data);
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

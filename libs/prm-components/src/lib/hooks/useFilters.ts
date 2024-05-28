import { EntityFiltering, EntityFilteringSchema } from '@nrcno/core-models';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface UseFilters {
  filters: EntityFiltering;
  parseFilters: (filters: EntityFiltering) => void;
  deleteFilter: (filter: string) => void;
}

export const useFilters = (): UseFilters => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<EntityFiltering>({});

  useEffect(() => {
    parseParams(searchParams);
  }, [JSON.stringify(searchParams)]);

  const parseFilters = (filters: EntityFiltering) => {
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
    const f = EntityFilteringSchema.parse(Object.fromEntries(params));
    setFilters(f);
  };

  const deleteFilter = (filter: string) => {
    searchParams.delete(filter);
    setSearchParams(searchParams);
    parseParams(searchParams);
  };

  return {
    filters,
    parseFilters,
    deleteFilter,
  };
};

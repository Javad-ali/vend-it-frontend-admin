import { useState, useCallback } from 'react';
import { DateRange } from 'react-day-picker';

export interface FilterState {
  search: string;
  status: string;
  dateRange: DateRange | undefined;
  [key: string]: string | DateRange | undefined;
}

export interface UseFiltersReturn {
  filters: FilterState;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setDateRange: (range: DateRange | undefined) => void;
  setFilter: (key: string, value: string | DateRange | undefined) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const initialFilters: FilterState = {
  search: '',
  status: '',
  dateRange: undefined,
};

export function useFilters(): UseFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const setStatus = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setDateRange = useCallback((dateRange: DateRange | undefined) => {
    setFilters((prev) => ({ ...prev, dateRange }));
  }, []);

  const setFilter = useCallback((key: string, value: string | DateRange | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== '' ||
    filters.dateRange !== undefined ||
    Object.keys(filters).some(
      (key) => !['search', 'status', 'dateRange'].includes(key) && filters[key] !== ''
    );

  return {
    filters,
    setSearch,
    setStatus,
    setDateRange,
    setFilter,
    resetFilters,
    hasActiveFilters,
  };
}

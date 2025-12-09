import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsePaginationReturn extends PaginationState {
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export function usePagination(initialLimit: number = 10): UsePaginationReturn {
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / limit) || 1;

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPage(1); // Reset to first page when limit changes
  }, []);

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  const canGoNext = page < totalPages;
  const canGoPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    canGoNext,
    canGoPrev,
  };
}

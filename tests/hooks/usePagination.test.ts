import { renderHook, act } from '@testing-library/react';
import { usePagination } from '@/hooks/usePagination';

describe('usePagination', () => {
    it('should initialize with correct default values', () => {
        const { result } = renderHook(() => usePagination(10));

        expect(result.current.page).toBe(1);
        expect(result.current.limit).toBe(10);
        expect(result.current.total).toBe(0);
        expect(result.current.totalPages).toBe(0);
    });

    it('should update page correctly', () => {
        const { result } = renderHook(() => usePagination(10));

        act(() => {
            result.current.setPage(2);
        });

        expect(result.current.page).toBe(2);
    });

    it('should update limit correctly', () => {
        const { result } = renderHook(() => usePagination(10));

        act(() => {
            result.current.setLimit(20);
        });

        expect(result.current.limit).toBe(20);
    });

    it('should calculate totalPages correctly', () => {
        const { result } = renderHook(() => usePagination(10));

        act(() => {
            result.current.setTotal(45);
        });

        expect(result.current.totalPages).toBe(5);
    });

    it('should go to next page', () => {
        const { result } = renderHook(() => usePagination(10));

        act(() => {
            result.current.setTotal(50);
        });

        act(() => {
            result.current.nextPage();
        });

        expect(result.current.page).toBe(2);
    });

    it('should go to previous page', () => {
        const { result } = renderHook(() => usePagination(10));

        act(() => {
            result.current.setTotal(50);
            result.current.setPage(3);
        });

        act(() => {
            result.current.prevPage();
        });

        expect(result.current.page).toBe(2);
    });

    it('should not go below page 1', () => {
        const { result } = renderHook(() => usePagination(10));

        act(() => {
            result.current.prevPage();
        });

        expect(result.current.page).toBe(1);
    });
});

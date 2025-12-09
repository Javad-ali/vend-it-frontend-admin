import { renderHook, act } from '@testing-library/react';
import { useBulkSelection } from '@/hooks/useBulkSelection';

describe('useBulkSelection', () => {
  it('should initialize with empty selection', () => {
    const { result } = renderHook(() => useBulkSelection<{ id: string }>());

    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.selectedCount).toBe(0);
  });

  it('should toggle selection', () => {
    const { result } = renderHook(() => useBulkSelection<{ id: string }>());

    act(() => {
      result.current.toggle('1');
    });

    expect(result.current.isSelected('1')).toBe(true);
    expect(result.current.selectedCount).toBe(1);

    act(() => {
      result.current.toggle('1');
    });

    expect(result.current.isSelected('1')).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it('should toggle all items', () => {
    const { result } = renderHook(() => useBulkSelection<{ id: string }>());
    const items = [{ id: '1' }, { id: '2' }, { id: '3' }];

    act(() => {
      result.current.toggleAll(items, (item) => item.id);
    });

    expect(result.current.selectedCount).toBe(3);
    expect(result.current.isAllSelected(items, (item) => item.id)).toBe(true);

    act(() => {
      result.current.toggleAll(items, (item) => item.id);
    });

    expect(result.current.selectedCount).toBe(0);
  });

  it('should clear selection', () => {
    const { result } = renderHook(() => useBulkSelection<{ id: string }>());

    act(() => {
      result.current.toggle('1');
      result.current.toggle('2');
    });

    expect(result.current.selectedCount).toBe(2);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedCount).toBe(0);
  });

  it('should correctly identify if all items are selected', () => {
    const { result } = renderHook(() => useBulkSelection<{ id: string }>());
    const items = [{ id: '1' }, { id: '2' }];

    expect(result.current.isAllSelected(items, (item) => item.id)).toBe(false);

    act(() => {
      result.current.toggle('1');
      result.current.toggle('2');
    });

    expect(result.current.isAllSelected(items, (item) => item.id)).toBe(true);
  });
});

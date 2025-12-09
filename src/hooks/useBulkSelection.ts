import { useState, useCallback } from 'react';

export interface UseBulkSelectionReturn<T = any> {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  toggleAll: (items: T[], getId: (item: T) => string) => void;
  clearSelection: () => void;
  isAllSelected: (items: T[], getId: (item: T) => string) => boolean;
  selectedCount: number;
}

export function useBulkSelection<T = any>(): UseBulkSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback((items: T[], getId: (item: T) => string) => {
    setSelectedIds((prev) => {
      const allIds = items.map(getId);
      const allSelected = allIds.every((id) => prev.has(id));

      if (allSelected) {
        // Deselect all
        return new Set();
      } else {
        // Select all
        return new Set(allIds);
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isAllSelected = useCallback(
    (items: T[], getId: (item: T) => string) => {
      if (items.length === 0) return false;
      return items.every((item) => selectedIds.has(getId(item)));
    },
    [selectedIds]
  );

  return {
    selectedIds,
    isSelected,
    toggle,
    toggleAll,
    clearSelection,
    isAllSelected,
    selectedCount: selectedIds.size,
  };
}

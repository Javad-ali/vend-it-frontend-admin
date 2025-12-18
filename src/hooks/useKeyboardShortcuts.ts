import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { ROUTE_SHORTCUTS } from '@/lib/shortcuts';

interface UseKeyboardShortcutsOptions {
  onShowHelp?: () => void;
  onLogout?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { onShowHelp, onLogout, enabled = true } = options;
  const router = useRouter();
  const sequenceRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow '/' to focus search even in inputs if it's empty
        if (event.key === '/' && target.tagName === 'INPUT') {
          const input = target as HTMLInputElement;
          if (input.value === '') {
            event.preventDefault();
            return;
          }
        }
        return;
      }

      const key = event.key.toLowerCase();
      const isShift = event.shiftKey;
      const isCtrl = event.ctrlKey || event.metaKey;

      // Handle Escape key
      if (key === 'escape') {
        event.preventDefault();
        // Trigger escape action (close dialogs, etc.)
        document.dispatchEvent(new CustomEvent('keyboard-escape'));
        return;
      }

      // Handle '?' for help
      if (event.key === '?') {
        event.preventDefault();
        onShowHelp?.();
        return;
      }

      // Handle '/' for search focus
      if (key === '/') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]') as HTMLInputElement;
        searchInput?.focus();
        return;
      }

      // Handle Shift+L for logout
      if (isShift && key === 'l') {
        event.preventDefault();
        onLogout?.();
        return;
      }

      // Handle Cmd/Ctrl+K for command palette (future feature)
      if (isCtrl && key === 'k') {
        event.preventDefault();
        // Command palette will be implemented later
        return;
      }

      // Handle sequence shortcuts (g + key)
      if (key === 'g') {
        event.preventDefault();
        sequenceRef.current = 'g';
        
        // Clear sequence after 1 second
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          sequenceRef.current = '';
        }, 1000);
        return;
      }

      // Handle second key in sequence
      if (sequenceRef.current === 'g') {
        event.preventDefault();
        const shortcut = `g ${key}`;
        const route = ROUTE_SHORTCUTS[shortcut];
        
        if (route) {
          router.push(route);
        }
        
        sequenceRef.current = '';
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    },
    [enabled, onShowHelp, onLogout, router]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, handleKeyPress]);

  return {
    // Expose method to programmatically trigger shortcuts
    triggerShortcut: (shortcut: string) => {
      const route = ROUTE_SHORTCUTS[shortcut];
      if (route) {
        router.push(route);
      }
    },
  };
}

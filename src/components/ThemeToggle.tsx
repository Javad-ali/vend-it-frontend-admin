'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { Button } from './ui/button';

// Custom hook to detect hydration - avoids the lint warning about setState in useEffect
const emptySubscribe = () => () => {};
const useMounted = () => useSyncExternalStore(
  emptySubscribe,
  () => true,
  () => false
);

export function ThemeToggle() {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="relative"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

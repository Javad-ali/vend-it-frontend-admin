// Keyboard shortcut definitions and mappings

export interface ShortcutConfig {
  key: string;
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'system';
}

export interface ShortcutMapping {
  keys: string;
  description: string;
  category: 'navigation' | 'actions' | 'system';
}

// Shortcut key combinations
export const SHORTCUTS: Record<string, ShortcutMapping> = {
  // Navigation shortcuts (g + key)
  'g d': {
    keys: 'g → d',
    description: 'Go to Dashboard',
    category: 'navigation',
  },
  'g u': {
    keys: 'g → u',
    description: 'Go to Users',
    category: 'navigation',
  },
  'g m': {
    keys: 'g → m',
    description: 'Go to Machines',
    category: 'navigation',
  },
  'g p': {
    keys: 'g → p',
    description: 'Go to Products',
    category: 'navigation',
  },
  'g o': {
    keys: 'g → o',
    description: 'Go to Orders',
    category: 'navigation',
  },
  'g c': {
    keys: 'g → c',
    description: 'Go to Campaigns',
    category: 'navigation',
  },
  'g a': {
    keys: 'g → a',
    description: 'Go to Activity Logs',
    category: 'navigation',
  },

  // Action shortcuts
  '/': {
    keys: '/',
    description: 'Focus search',
    category: 'actions',
  },
  '?': {
    keys: '?',
    description: 'Show keyboard shortcuts',
    category: 'actions',
  },
  Escape: {
    keys: 'Esc',
    description: 'Close dialog/Cancel',
    category: 'actions',
  },

  // System shortcuts
  'shift+l': {
    keys: 'Shift + L',
    description: 'Logout',
    category: 'system',
  },
};

// Route mappings for navigation shortcuts
export const ROUTE_SHORTCUTS: Record<string, string> = {
  'g d': '/dashboard',
  'g u': '/users',
  'g m': '/machines',
  'g p': '/products',
  'g o': '/orders',
  'g c': '/campaigns',
  'g a': '/activity-logs',
  'g f': '/feedback',
  'g n': '/notifications',
  'g s': '/sessions',
};

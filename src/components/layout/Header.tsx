import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ShortcutsDialog } from '@/components/ShortcutsDialog';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

const Header: React.FC = () => {
  const { admin, logout } = useAuth();
  const [showShortcuts, setShowShortcuts] = useState(false);

  return (
    <header className="border-b bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Welcome, {admin?.name || 'Admin'}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationsDropdown />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Link
            href="/profile"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Profile
          </Link>
          <Link
            href="/change-password"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Change Password
          </Link>
          <button
            onClick={logout}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
      <ShortcutsDialog open={showShortcuts} onOpenChange={setShowShortcuts} />
    </header>
  );
};

export default Header;

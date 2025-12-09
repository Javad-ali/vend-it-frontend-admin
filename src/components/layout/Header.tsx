import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { NotificationsDropdown } from '@/components/notifications-dropdown';

const Header: React.FC = () => {
    const { admin, logout } = useAuth();

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Welcome, {admin?.name || 'Admin'}</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <NotificationsDropdown />
                    <ThemeToggle />
                    <Link
                        href="/profile"
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                    >
                        Profile
                    </Link>
                    <Link
                        href="/change-password"
                        className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                    >
                        Change Password
                    </Link>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;

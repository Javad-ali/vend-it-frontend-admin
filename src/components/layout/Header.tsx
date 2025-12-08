import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-gray-800">Welcome, {user?.name || 'Admin'}</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <Link
                        href="/profile"
                        className="text-gray-600 hover:text-gray-800"
                    >
                        Profile
                    </Link>
                    <Link
                        href="/change-password"
                        className="text-gray-600 hover:text-gray-800"
                    >
                        Change Password
                    </Link>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;

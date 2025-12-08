import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Sidebar: React.FC = () => {
    const router = useRouter();

    const menuItems = [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/users', label: 'Users', icon: '👥' },
        { href: '/machines', label: 'Machines', icon: '🖥️' },
        { href: '/products', label: 'Products', icon: '📦' },
        { href: '/orders', label: 'Orders', icon: '🛒' },
        { href: '/campaigns', label: 'Campaigns', icon: '📢' },
        { href: '/categories', label: 'Categories', icon: '📑' },
        { href: '/feedback', label: 'Feedback', icon: '💬' },
        { href: '/content', label: 'Content', icon: '📝' },
    ];

    return (
        <aside className="w-64 bg-white shadow-lg">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            </div>
            <nav className="mt-6">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${router.pathname.startsWith(item.href) ? 'bg-gray-100 border-l-4 border-blue-500' : ''
                            }`}
                    >
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;

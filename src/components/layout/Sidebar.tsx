import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Sidebar: React.FC = () => {
  const router = useRouter();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
    { href: '/users', label: 'Users', icon: '👥' },
    { href: '/machines', label: 'Machines', icon: '🖥️' },
    { href: '/products', label: 'Products', icon: '📦' },
    { href: '/orders', label: 'Orders', icon: '🛒' },
    { href: '/campaigns', label: 'Campaigns', icon: '📢' },
    { href: '/coupons', label: 'Coupons', icon: '🎟️' },
    { href: '/categories', label: 'Categories', icon: '📑' },
    { href: '/feedback', label: 'Feedback', icon: '💬' },
    { href: '/content', label: 'Content', icon: '📝' },
    { href: '/activity-logs', label: 'Activity Logs', icon: '🕒' },
    { href: '/sessions', label: 'Sessions', icon: '🔐' },
    { href: '/cache', label: 'Cache', icon: '💾' },
  ];

  return (
    <aside className="w-64 border-r bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Panel</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 ${
              router.pathname.startsWith(item.href)
                ? 'border-l-4 border-blue-500 bg-gray-100 dark:border-blue-400 dark:bg-gray-700'
                : ''
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

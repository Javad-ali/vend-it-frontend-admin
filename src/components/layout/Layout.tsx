import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
export default function Layout({ children }: { children: React.ReactNode }) {
  const { admin } = useAuth();
  if (!admin) {
    return <>{children}</>;
  }
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 dark:bg-gray-900">{children}</main>
      </div>
    </div>
  );
}

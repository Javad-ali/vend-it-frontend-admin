import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ActivityFilters, type ActivityFilters as ActivityFiltersType } from '@/components/ActivityFilters';
import { toast } from 'sonner';
import { Search, Download, Filter, Clock, User, Edit, Trash2, LogIn, LogOut } from 'lucide-react';
import { useGetActivityLogsQuery } from '@/store/api/adminApi';
import { exportToCSV, exportToExcel } from '@/lib/export';
import { formatDate } from '@/lib/utils';
import type { ActivityLog } from '@/types/api';

export default function ActivityLogs() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [filters, setFilters] = useState<ActivityFiltersType>({});

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, error } = useGetActivityLogsQuery({
    page,
    limit,
    action: actionFilter !== 'all' ? actionFilter : undefined,
    search: debouncedSearch || undefined,
    startDate: filters.startDate,
    endDate: filters.endDate,
    entityType: filters.entityType,
  });

  const logs = data?.data?.logs || [];
  const meta = data?.data?.meta;

  const handleExportCSV = () => {
    exportToCSV(logs, `activity-logs-${new Date().toISOString().split('T')[0]}.csv`, [
      { key: 'admin_name', label: 'Admin' },
      { key: 'action', label: 'Action' },
      { key: 'entity', label: 'Entity' },
      { key: 'entity_id', label: 'Entity ID' },
      { key: 'details', label: 'Details' },
      { key: 'ip_address', label: 'IP Address' },
      { key: 'created_at', label: 'Date', format: (val) => formatDate(val) },
    ]);
    toast.success('Activity logs exported successfully');
  };

  const handleExportExcel = () => {
    exportToExcel(
      logs,
      `activity-logs-${new Date().toISOString().split('T')[0]}`,
      'Activity Logs',
      [
        { key: 'admin_name', label: 'Admin' },
        { key: 'action', label: 'Action' },
        { key: 'entity', label: 'Entity' },
        { key: 'entity_id', label: 'Entity ID' },
        { key: 'details', label: 'Details' },
        { key: 'ip_address', label: 'IP Address' },
        { key: 'created_at', label: 'Date', format: (val) => formatDate(val) },
      ]
    );
    toast.success('Activity logs exported successfully');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Edit className="h-4 w-4 text-green-500" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'login':
        return <LogIn className="h-4 w-4 text-purple-500" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'login':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'logout':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Activity Logs
            </h1>
            <p className="text-muted-foreground">Track all admin actions and system events</p>
          </div>
          <TableSkeleton columns={6} rows={10} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg text-red-500">Failed to load activity logs</div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Activity Logs
            </h1>
            <p className="text-muted-foreground">Track all admin actions and system events</p>
          </div>

          {/* Advanced Filters */}
          <ActivityFilters
            onFilterChange={(newFilters) => {
              setFilters(newFilters);
              setPage(1);
            }}
            onReset={() => {
              setFilters({});
              setPage(1);
            }}
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={actionFilter}
                onValueChange={(val) => {
                  setActionFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>

          {/* Timeline View */}
          <div className="space-y-4">
            {logs.length === 0 ? (
              <Card>
                <CardContent className="text-muted-foreground p-12 text-center">
                  No activity logs found
                </CardContent>
              </Card>
            ) : (
              logs.map((log: ActivityLog) => (
                <Card key={log.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex-shrink-0">{getActionIcon(log.action)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <Badge className={getActionColor(log.action)}>
                            {log.action.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {log.entity}
                          </span>
                          {log.entity_id && (
                            <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
                              #{log.entity_id}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{log.admin_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(log.created_at)}</span>
                          </div>
                          {log.ip_address && (
                            <span className="font-mono text-xs">{log.ip_address}</span>
                          )}
                        </div>
                        {log.details && (
                          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            {log.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {meta && meta.total > 0 && (
            <Pagination
              currentPage={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              itemsPerPage={limit}
              onItemsPerPageChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

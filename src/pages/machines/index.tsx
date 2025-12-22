import { useMemo, useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Server, Search, Download, Filter, QrCode } from 'lucide-react';
import Link from 'next/link';
import { useGetMachinesQuery, useRegenerateQRMutation } from '@/store/api/adminApi';
import { usePagination } from '@/hooks/usePagination';
import { exportToCSV, exportToExcel } from '@/lib/export';
import type { Machine } from '@/types/api';
import { formatDate, getStatusVariant } from '@/lib/utils';
import { formatMachineId } from '@/lib/id-format';

export default function Machines() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, error } = useGetMachinesQuery({
    page,
    limit,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: debouncedSearch || undefined,
  });

  const [regenerateQR] = useRegenerateQRMutation();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    open: false,
    title: '',
    description: '',
    action: async () => {},
  });

  const machines = data?.data?.machines || [];
  const meta = data?.data?.meta;

  const handleRegenerateQR = (machineId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Regenerate QR Code',
      description: 'Are you sure you want to regenerate the QR code for this machine?',
      action: async () => {
        try {
          await regenerateQR(machineId).unwrap();
          toast.success('QR code regenerated successfully');
        } catch (error) {
          toast.error('Failed to regenerate QR code');
          throw error;
        }
      },
    });
  };

  const handleExportCSV = () => {
    exportToCSV(machines, `machines-${new Date().toISOString().split('T')[0]}.csv`, [
      { key: 'machine_u_id', label: 'Machine ID' },
      { key: 'machine_name', label: 'Name' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status' },
    ]);
    toast.success('Machines exported successfully');
  };

  const handleExportExcel = () => {
    exportToExcel(machines, `machines-${new Date().toISOString().split('T')[0]}`, 'Machines', [
      { key: 'machine_u_id', label: 'Machine ID' },
      { key: 'machine_name', label: 'Name' },
      { key: 'location', label: 'Location' },
      { key: 'status', label: 'Status' },
    ]);
    toast.success('Machines exported successfully');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
            <p className="text-muted-foreground">Manage vending machines</p>
          </div>
          <TableSkeleton columns={5} rows={10} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg text-red-500">Failed to load machines</div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
            <p className="text-muted-foreground">Manage vending machines</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search machines..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
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

          <div className="rounded-md border text-black">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground text-center">
                      No machines found
                    </TableCell>
                  </TableRow>
                ) : (
                  machines.map((machine: Machine) => (
                    <TableRow key={machine.machine_u_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{machine.machine_name || formatMachineId(machine.machine_u_id)}</p>
                          <p className="font-mono text-xs text-gray-400">
                            {formatMachineId(machine.machine_u_id, machine.machine_name)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{machine.location || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(machine.status || '')}>
                          {machine.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/machines/${machine.machine_u_id}/products`}>
                            <Button variant="ghost" size="sm">
                              <Server className="mr-1 h-4 w-4" />
                              Products
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerateQR(machine.machine_u_id)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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

          <ConfirmDialog
            open={confirmDialog.open}
            onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
            title={confirmDialog.title}
            description={confirmDialog.description}
            onConfirm={confirmDialog.action}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

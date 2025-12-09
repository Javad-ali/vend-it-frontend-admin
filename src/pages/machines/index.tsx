import { useMemo, useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { Server, Search, QrCode, Download, Filter } from 'lucide-react';
import Link from 'next/link';
import { useGetMachinesQuery, useRegenerateQRMutation } from '@/store/api/adminApi';
import { usePagination } from '@/hooks/usePagination';
import { exportToCSV, exportToExcel } from '@/lib/export';
import { formatDate, getStatusVariant } from '@/lib/utils';

interface Machine {
    machine_u_id: string;
    machine_name: string;
    location?: string;
    status?: string;
}

export default function Machines() {
    const pagination = usePagination(10);
    const { data, isLoading, error } = useGetMachinesQuery(undefined);
    const [regenerateQR] = useRegenerateQRMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: string;
        action: () => Promise<void>;
    }>({
        open: false,
        title: '',
        description: '',
        action: async () => { },
    });

    const machines = data?.data?.machines || [];

    // Filter machines
    const filteredMachines = useMemo(() => {
        let result = machines;

        if (searchTerm) {
            result = result.filter(
                (machine: Machine) =>
                    machine.machine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    machine.machine_u_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    machine.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            result = result.filter((machine: Machine) => machine.status?.toLowerCase() === statusFilter);
        }

        return result;
    }, [searchTerm, statusFilter, machines]);

    // Paginate machines
    const paginatedMachines = useMemo(() => {
        const startIndex = (pagination.page - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        return filteredMachines.slice(startIndex, endIndex);
    }, [filteredMachines, pagination.page, pagination.limit]);

    useEffect(() => {
        pagination.setTotal(filteredMachines.length);
    }, [filteredMachines.length, pagination]);

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
        exportToCSV(
            filteredMachines,
            `machines-${new Date().toISOString().split('T')[0]}.csv`,
            [
                { key: 'machine_u_id', label: 'Machine ID' },
                { key: 'machine_name', label: 'Name' },
                { key: 'location', label: 'Location' },
                { key: 'status', label: 'Status' },
            ]
        );
        toast.success('Machines exported successfully');
    };

    const handleExportExcel = () => {
        exportToExcel(
            filteredMachines,
            `machines-${new Date().toISOString().split('T')[0]}`,
            'Machines',
            [
                { key: 'machine_u_id', label: 'Machine ID' },
                { key: 'machine_name', label: 'Name' },
                { key: 'location', label: 'Location' },
                { key: 'status', label: 'Status' },
            ]
        );
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
                <div className="flex items-center justify-center h-64">
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
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search machines..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <Filter className="h-4 w-4 mr-2" />
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
                                <Download className="h-4 w-4 mr-2" />
                                CSV
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExportExcel}>
                                <Download className="h-4 w-4 mr-2" />
                                Excel
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border text-black">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Machine ID</TableHead>
                                    <TableHead>Machine Name</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedMachines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            No machines found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedMachines.map((machine: Machine) => (
                                        <TableRow key={machine.machine_u_id}>
                                            <TableCell className="font-medium">{machine.machine_u_id}</TableCell>
                                            <TableCell>{machine.machine_name || 'N/A'}</TableCell>
                                            <TableCell>{machine.location || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(machine.status || '')}>
                                                    {machine.status || 'Unknown'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/machines/${machine.machine_u_id}/products`}>
                                                        <Button variant="ghost" size="sm">
                                                            <Server className="h-4 w-4 mr-1" />
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

                    {filteredMachines.length > 0 && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={pagination.setPage}
                            itemsPerPage={pagination.limit}
                            onItemsPerPageChange={pagination.setLimit}
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


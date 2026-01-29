import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Power,
  Search,
  Download,
  Copy,
  QrCode,
  Wallet,
} from 'lucide-react';
import {
  useGetVouchersQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useToggleVoucherStatusMutation,
} from '@/store/api/adminApi';
import type { Voucher } from '@/types/api';
import { usePagination } from '@/hooks/usePagination';
import { exportToCSV } from '@/lib/export';
import { formatDate } from '@/lib/utils';

interface VoucherFormData {
  code: string;
  description: string;
  amount: string;
  maxUsesPerUser: string;
  maxTotalUses: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export default function VouchersPage() {
  const router = useRouter();
  const pagination = usePagination(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data, isLoading, error } = useGetVouchersQuery({
    page: pagination.page,
    limit: pagination.limit,
    status: statusFilter,
    search: searchTerm || undefined,
  });

  const [createVoucher, { isLoading: isCreating }] = useCreateVoucherMutation();
  const [updateVoucher, { isLoading: isUpdating }] = useUpdateVoucherMutation();
  const [deleteVoucher] = useDeleteVoucherMutation();
  const [toggleVoucherStatus] = useToggleVoucherStatusMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    action: async () => {},
  });

  const [formData, setFormData] = useState<VoucherFormData>({
    code: '',
    description: '',
    amount: '',
    maxUsesPerUser: '1',
    maxTotalUses: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  const vouchers = data?.data?.vouchers || [];
  const meta = data?.data?.meta;

  useEffect(() => {
    if (meta) {
      pagination.setTotal(meta.total);
    }
  }, [meta, pagination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code || !formData.amount || !formData.validFrom || !formData.validUntil) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Code format validation
    if (!/^[A-Z0-9_-]+$/.test(formData.code)) {
      toast.error('Voucher code must be uppercase alphanumeric with hyphens/underscores');
      return;
    }

    const payload = {
      code: formData.code.toUpperCase(),
      description: formData.description || undefined,
      amount: parseFloat(formData.amount),
      maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser) : 1,
      maxTotalUses: formData.maxTotalUses ? parseInt(formData.maxTotalUses) : undefined,
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
      isActive: formData.isActive,
    };

    try {
      if (editingVoucher) {
        await updateVoucher({ id: editingVoucher.id, data: payload }).unwrap();
        toast.success('Voucher updated successfully');
      } else {
        await createVoucher(payload).unwrap();
        toast.success('Voucher created with QR code');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || 
        (editingVoucher ? 'Failed to update voucher' : 'Failed to create voucher');
      toast.error(errorMsg);
    }
  };

  const handleDelete = (voucher: Voucher) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Voucher',
      description: `Are you sure you want to delete voucher "${voucher.code}"? This will also delete the QR code. This action cannot be undone.`,
      action: async () => {
        try {
          await deleteVoucher(voucher.id).unwrap();
          toast.success('Voucher deleted successfully');
        } catch (error) {
          toast.error('Failed to delete voucher');
          throw error;
        }
      },
    });
  };

  const handleToggle = async (voucher: Voucher) => {
    try {
      await toggleVoucherStatus(voucher.id).unwrap();
      toast.success(`Voucher ${voucher.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error(`Failed to ${voucher.is_active ? 'deactivate' : 'activate'} voucher`);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      amount: '',
      maxUsesPerUser: '1',
      maxTotalUses: '',
      validFrom: '',
      validUntil: '',
      isActive: true,
    });
    setEditingVoucher(null);
  };

  const openEdit = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      description: voucher.description || '',
      amount: voucher.amount.toString(),
      maxUsesPerUser: voucher.max_uses_per_user.toString(),
      maxTotalUses: voucher.max_total_uses?.toString() || '',
      validFrom: voucher.valid_from.slice(0, 16),
      validUntil: voucher.valid_until.slice(0, 16),
      isActive: voucher.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    exportToCSV(vouchers, `vouchers-${new Date().toISOString().split('T')[0]}.csv`, [
      { key: 'code', label: 'Code' },
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount (KWD)' },
      { key: 'current_total_uses', label: 'Uses' },
      { key: 'max_total_uses', label: 'Max Uses' },
      { key: 'is_active', label: 'Active', format: (val) => val ? 'Yes' : 'No' },
      { key: 'valid_from', label: 'Valid From', format: (val) => val ? formatDate(val as string) : 'N/A' },
      { key: 'valid_until', label: 'Valid Until', format: (val) => val ? formatDate(val as string) : 'N/A' },
    ]);
    toast.success('Vouchers exported successfully');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Voucher code copied to clipboard');
  };

  const getStatusBadge = (voucher: Voucher) => {
    if (!voucher.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    const now = new Date();
    const validFrom = new Date(voucher.valid_from);
    const validUntil = new Date(voucher.valid_until);
    
    if (now < validFrom) {
      return <Badge variant="default">Scheduled</Badge>;
    } else if (now > validUntil) {
      return <Badge variant="destructive">Expired</Badge>;
    } else {
      return <Badge variant="default" className="bg-green-500">Active</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Voucher Codes</h1>
          <TableSkeleton columns={8} rows={10} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-red-500">Failed to load vouchers</div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Voucher Codes</h1>
              <p className="text-muted-foreground">Manage wallet credit vouchers with QR codes</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Voucher
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QR</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No vouchers found
                    </TableCell>
                  </TableRow>
                ) : (
                  vouchers.map((voucher) => (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        {voucher.qr_code_url ? (
                          <img 
                            src={voucher.qr_code_url} 
                            alt="QR" 
                            className="w-10 h-10 rounded border"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted flex items-center justify-center rounded">
                            <QrCode className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-semibold">{voucher.code}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(voucher.code)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        {voucher.description && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                            {voucher.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Wallet className="h-4 w-4 text-green-500" />
                          <span className="font-semibold">{voucher.amount.toFixed(3)} KWD</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {voucher.current_total_uses} / {voucher.max_total_uses || '∞'}
                          </span>
                          {voucher.max_total_uses && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min((voucher.current_total_uses / voucher.max_total_uses) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(voucher.valid_until)}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(voucher)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/vouchers/${voucher.id}`)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(voucher)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggle(voucher)}
                            title={voucher.is_active ? 'Deactivate' : 'Activate'}
                          >
                            <Power className={`h-4 w-4 ${voucher.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(voucher)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={meta.totalPages}
              onPageChange={pagination.setPage}
            />
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}</DialogTitle>
              <DialogDescription>
                {editingVoucher ? 'Update voucher details' : 'Create a wallet credit voucher with auto-generated QR code'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="code">Voucher Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="WELCOME5KWD"
                    required
                    disabled={!!editingVoucher}
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Uppercase letters, numbers, hyphens, underscores only</p>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this voucher..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Credit Amount (KWD) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.001"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min="0.001"
                    max="1000"
                    placeholder="5.000"
                  />
                </div>

                <div>
                  <Label htmlFor="maxUsesPerUser">Max Uses Per User</Label>
                  <Input
                    id="maxUsesPerUser"
                    type="number"
                    value={formData.maxUsesPerUser}
                    onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                    min="1"
                    placeholder="1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxTotalUses">Max Total Uses</Label>
                  <Input
                    id="maxTotalUses"
                    type="number"
                    value={formData.maxTotalUses}
                    onChange={(e) => setFormData({ ...formData, maxTotalUses: e.target.value })}
                    min="1"
                    placeholder="Unlimited"
                  />
                </div>

                <div></div>

                <div>
                  <Label htmlFor="validFrom">Valid From *</Label>
                  <Input
                    id="validFrom"
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <Input
                    id="validUntil"
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating ? 'Saving...' : editingVoucher ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={confirmDialog.action}
        />
      </Layout>
    </ProtectedRoute>
  );
}

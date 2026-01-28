import { useMemo, useState, useEffect } from 'react';
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
  Percent,
  DollarSign,
} from 'lucide-react';
import {
  useGetCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useDeactivateCouponMutation,
} from '@/store/api/adminApi';
import type { DiscountCoupon } from '@/types/api';
import { usePagination } from '@/hooks/usePagination';
import { exportToCSV, exportToExcel } from '@/lib/export';
import { formatDate } from '@/lib/utils';

interface CouponFormData {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
  minPurchaseAmount: string;
  maxDiscountAmount: string;
  maxUsesPerUser: string;
  maxTotalUses: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export default function Coupons() {
  const router = useRouter();
  const pagination = usePagination(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data, isLoading, error } = useGetCouponsQuery({
    page: pagination.page,
    limit: pagination.limit,
    status: statusFilter,
    search: searchTerm || undefined,
  });

  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();
  const [deactivateCoupon] = useDeactivateCouponMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    action: async () => {},
  });

  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minPurchaseAmount: '0',
    maxDiscountAmount: '',
    maxUsesPerUser: '1',
    maxTotalUses: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
  });

  const coupons = data?.data?.coupons || [];
  const meta = data?.data?.meta;

  useEffect(() => {
    if (meta) {
      pagination.setTotal(meta.total);
    }
  }, [meta, pagination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code || !formData.discountValue || !formData.validFrom || !formData.validUntil) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Code format validation
    if (!/^[A-Z0-9]+$/.test(formData.code)) {
      toast.error('Coupon code must be uppercase alphanumeric only');
      return;
    }

    // Percentage validation
    if (formData.discountType === 'PERCENTAGE' && parseFloat(formData.discountValue) > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    const payload = {
      code: formData.code.toUpperCase(),
      description: formData.description || undefined,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : 0,
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
      maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser) : undefined,
      maxTotalUses: formData.maxTotalUses ? parseInt(formData.maxTotalUses) : undefined,
      // Convert datetime-local to ISO 8601 format with timezone
      validFrom: new Date(formData.validFrom).toISOString(),
      validUntil: new Date(formData.validUntil).toISOString(),
      isActive: formData.isActive,
    };

    try {
      if (editingCoupon) {
        await updateCoupon({ id: editingCoupon.id, data: payload }).unwrap();
        toast.success('Coupon updated successfully');
      } else {
        await createCoupon(payload).unwrap();
        toast.success('Coupon created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      const errorMsg = (error as { data?: { message?: string } })?.data?.message || (editingCoupon ? 'Failed to update coupon' : 'Failed to create coupon');
      toast.error(errorMsg);
    }
  };

  const handleDelete = (coupon: DiscountCoupon) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Coupon',
      description: `Are you sure you want to delete coupon "${coupon.code}"? This action cannot be undone.`,
      action: async () => {
        try {
          await deleteCoupon(coupon.id).unwrap();
          toast.success('Coupon deleted successfully');
        } catch (error) {
          toast.error('Failed to delete coupon');
          throw error;
        }
      },
    });
  };

  const handleDeactivate = async (coupon: DiscountCoupon) => {
    try {
      await deactivateCoupon(coupon.id).unwrap();
      toast.success(`Coupon ${coupon.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error(`Failed to ${coupon.is_active ? 'deactivate' : 'activate'} coupon`);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minPurchaseAmount: '0',
      maxDiscountAmount: '',
      maxUsesPerUser: '1',
      maxTotalUses: '',
      validFrom: '',
      validUntil: '',
      isActive: true,
    });
    setEditingCoupon(null);
  };

  const openEdit = (coupon: DiscountCoupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value.toString(),
      minPurchaseAmount: coupon.min_purchase_amount?.toString() || '0',
      maxDiscountAmount: coupon.max_discount_amount?.toString() || '',
      maxUsesPerUser: coupon.max_uses_per_user?.toString() || '1',
      maxTotalUses: coupon.max_total_uses?.toString() || '',
      validFrom: coupon.valid_from.split('.')[0], // Remove timezone for input
      validUntil: coupon.valid_until.split('.')[0],
      isActive: coupon.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleExport = () => {
    exportToCSV(coupons, `coupons-${new Date().toISOString().split('T')[0]}.csv`, [
      { key: 'code', label: 'Code' },
      { key: 'description', label: 'Description' },
      { key: 'discount_type', label: 'Type' },
      { key: 'discount_value', label: 'Value' },
      { key: 'current_total_uses', label: 'Uses' },
      { key: 'max_total_uses', label: 'Max Uses' },
      { key: 'is_active', label: 'Active', format: (val) => val ? 'Yes' : 'No' },
      { key: 'valid_from', label: 'Valid From', format: (val) => val ? formatDate(val as string) : 'N/A' },
      { key: 'valid_until', label: 'Valid Until', format: (val) => val ? formatDate(val as string) : 'N/A' },
    ]);
    toast.success('Coupons exported successfully');
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard');
  };

  const getStatusBadge = (coupon: DiscountCoupon) => {
    if (!coupon.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);
    
    if (now < validFrom) {
      return <Badge variant="default">Upcoming</Badge>;
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
          <h1 className="text-3xl font-bold">Discount Coupons</h1>
          <TableSkeleton columns={8} rows={10} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-red-500">Failed to load coupons</div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Discount Coupons</h1>
              <p className="text-muted-foreground">Manage promotional discount coupons</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Coupon
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by code or description..."
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
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Min Purchase</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No coupons found
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-semibold">{coupon.code}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCode(coupon.code)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {coupon.discount_type === 'PERCENTAGE' ? (
                            <Percent className="h-4 w-4 text-blue-500" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-sm">{coupon.discount_type === 'PERCENTAGE' ? 'Percentage' : 'Fixed'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          {coupon.discount_type === 'PERCENTAGE' 
                            ? `${coupon.discount_value}%` 
                            : `${coupon.discount_value} KWD`
                          }
                        </span>
                      </TableCell>
                      <TableCell>{coupon.min_purchase_amount || 0} KWD</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {coupon.current_total_uses} / {coupon.max_total_uses || '∞'}
                          </span>
                          {coupon.max_total_uses && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min((coupon.current_total_uses / coupon.max_total_uses) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatDate(coupon.valid_until)}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(coupon)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/coupons/${coupon.id}`)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(coupon)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(coupon)}
                            title={coupon.is_active ? 'Deactivate' : 'Activate'}
                          >
                            <Power className={`h-4 w-4 ${coupon.is_active ? 'text-green-500' : 'text-gray-400'}`} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(coupon)}
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
              <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
              <DialogDescription>
                {editingCoupon ? 'Update coupon details' : 'Create a new discount coupon'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SAVE20"
                    required
                    disabled={!!editingCoupon}
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Uppercase alphanumeric only</p>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this coupon..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="discountType">Discount Type *</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: 'PERCENTAGE' | 'FIXED_AMOUNT') => setFormData({ ...formData, discountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount (KWD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discountValue">
                    Discount Value * {formData.discountType === 'PERCENTAGE' ? '(%)' : '(KWD)'}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    step="0.001"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    required
                    min="0"
                    max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                  />
                </div>

                <div>
                  <Label htmlFor="minPurchaseAmount">Min Purchase Amount (KWD)</Label>
                  <Input
                    id="minPurchaseAmount"
                    type="number"
                    step="0.001"
                    value={formData.minPurchaseAmount}
                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                    min="0"
                  />
                </div>

                {formData.discountType === 'PERCENTAGE' && (
                  <div>
                    <Label htmlFor="maxDiscountAmount">Max Discount Amount (KWD)</Label>
                    <Input
                      id="maxDiscountAmount"
                      type="number"
                      step="0.001"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      min="0"
                      placeholder="Optional"
                    />
                  </div>
                )}

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
                  {isCreating || isUpdating ? 'Saving...' : editingCoupon ? 'Update' : 'Create'}
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

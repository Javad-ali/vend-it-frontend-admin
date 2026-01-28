import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Power,
  Copy,
  Percent,
  DollarSign,
  Users,
  TrendingUp,
  Wallet,
  BarChart3,
} from 'lucide-react';
import {
  useGetCouponDetailsQuery,
  useDeleteCouponMutation,
  useDeactivateCouponMutation,
  useGetCouponUsageQuery,
} from '@/store/api/adminApi';
import { usePagination } from '@/hooks/usePagination';
import { formatDate } from '@/lib/utils';

export default function CouponDetails() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const pagination = usePagination(20);

  const { data, isLoading, error } = useGetCouponDetailsQuery(id, {
    skip: !id,
  });

  const { data: usageData, isLoading: isLoadingUsage } = useGetCouponUsageQuery(
    {
      id,
      page: pagination.page,
      limit: pagination.limit,
    },
    {
      skip: !id,
    }
  );

  const [deleteCoupon] = useDeleteCouponMutation();
  const [deactivateCoupon] = useDeactivateCouponMutation();

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    action: async () => {},
  });

  const coupon = data?.data?.coupon;
  const stats = data?.data?.stats;
  const history = usageData?.data?.history || [];
  const usageMeta = usageData?.data?.meta;

  const handleDelete = () => {
    if (!coupon) return;
    setConfirmDialog({
      open: true,
      title: 'Delete Coupon',
      description: `Are you sure you want to delete coupon "${coupon.code}"? This action cannot be undone.`,
      action: async () => {
        try {
          await deleteCoupon(coupon.id).unwrap();
          toast.success('Coupon deleted successfully');
          router.push('/coupons');
        } catch (error) {
          toast.error('Failed to delete coupon');
          throw error;
        }
      },
    });
  };

  const handleDeactivate = async () => {
    if (!coupon) return;
    try {
      await deactivateCoupon(coupon.id).unwrap();
      toast.success(`Coupon ${coupon.is_active ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      toast.error(`Failed to ${coupon.is_active ? 'deactivate' : 'activate'} coupon`);
    }
  };

  const copyCode = () => {
    if (!coupon) return;
    navigator.clipboard.writeText(coupon.code);
    toast.success('Coupon code copied to clipboard');
  };

  const getStatusBadge = () => {
    if (!coupon) return null;
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
          <Button variant="ghost" onClick={() => router.push('/coupons')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Coupons
          </Button>
          <h1 className="text-3xl font-bold">Loading...</h1>
          <TableSkeleton columns={4} rows={5} />
        </div>
      </Layout>
    );
  }

  if (error || !coupon) {
    return (
      <Layout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.push('/coupons')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Coupons
          </Button>
          <div className="text-red-500">Failed to load coupon details</div>
        </div>
      </Layout>
    );
  }

  const usagePercentage = coupon.max_total_uses
    ? (coupon.current_total_uses / coupon.max_total_uses) * 100
    : 0;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push('/coupons')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Coupons
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/coupons?edit=${coupon.id}`)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDeactivate}
              >
                <Power className="h-4 w-4 mr-2" />
                {coupon.is_active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Coupon Info Card */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <code className="text-2xl font-mono font-bold">{coupon.code}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyCode}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {getStatusBadge()}
                </div>
                {coupon.description && (
                  <p className="text-muted-foreground">{coupon.description}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <div className="flex items-center gap-2 mt-1">
                  {coupon.discount_type === 'PERCENTAGE' ? (
                    <>
                      <Percent className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold">Percentage</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">Fixed Amount</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Discount Value</p>
                <p className="text-xl font-bold mt-1">
                  {coupon.discount_type === 'PERCENTAGE'
                    ? `${coupon.discount_value}%`
                    : `${coupon.discount_value} KWD`}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Min Purchase</p>
                <p className="text-xl font-bold mt-1">{coupon.min_purchase_amount || 0} KWD</p>
              </div>

              {coupon.max_discount_amount && (
                <div>
                  <p className="text-sm text-muted-foreground">Max Discount</p>
                  <p className="text-xl font-bold mt-1">{coupon.max_discount_amount} KWD</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Valid From</p>
                <p className="font-medium mt-1">{formatDate(coupon.valid_from)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Valid Until</p>
                <p className="font-medium mt-1">{formatDate(coupon.valid_until)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Max Uses Per User</p>
                <p className="font-medium mt-1">{coupon.max_uses_per_user || 'Unlimited'}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium mt-1">{formatDate(coupon.created_at)}</p>
              </div>
            </div>

            {/* Usage Progress */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Total Usage</p>
                <p className="text-sm font-medium">
                  {coupon.current_total_uses} / {coupon.max_total_uses || '∞'}
                </p>
              </div>
              {coupon.max_total_uses && (
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      usagePercentage >= 90
                        ? 'bg-red-500'
                        : usagePercentage >= 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Redemptions</p>
                    <p className="text-2xl font-bold">{stats.totalRedemptions || 0}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Users</p>
                    <p className="text-2xl font-bold">{stats.uniqueUsers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Wallet className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Discount Given</p>
                    <p className="text-2xl font-bold">{(stats.totalDiscountGiven || 0).toFixed(3)} KWD</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Discount</p>
                    <p className="text-2xl font-bold">{(stats.averageDiscount || 0).toFixed(3)} KWD</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Usage History */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Usage History</h2>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Original Amount</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Final Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsage ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No usage history yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((usage) => (
                      <TableRow key={usage.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{usage.user_name || 'Unknown'}</p>
                            {usage.user_phone && (
                              <p className="text-sm text-muted-foreground">{usage.user_phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{usage.original_amount.toFixed(3)} KWD</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600 font-semibold">
                            -{usage.discount_applied.toFixed(3)} KWD
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold">{usage.final_amount.toFixed(3)} KWD</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(usage.used_at)}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Usage Pagination */}
            {usageMeta && usageMeta.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={usageMeta.totalPages}
                onPageChange={pagination.setPage}
              />
            )}
          </div>
        </div>

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

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
  Download,
  Users,
  TrendingUp,
  Wallet,
  BarChart3,
  QrCode,
} from 'lucide-react';
import {
  useGetVoucherDetailsQuery,
  useDeleteVoucherMutation,
  useToggleVoucherStatusMutation,
  useGetVoucherRedemptionsQuery,
} from '@/store/api/adminApi';
import { usePagination } from '@/hooks/usePagination';
import { formatDate } from '@/lib/utils';

export default function VoucherDetails() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const pagination = usePagination(20);

  const { data, isLoading, error, refetch } = useGetVoucherDetailsQuery(id, {
    skip: !id,
  });

  const { data: redemptionsData, isLoading: isLoadingRedemptions } = useGetVoucherRedemptionsQuery(
    {
      id,
      page: pagination.page,
      limit: pagination.limit,
    },
    {
      skip: !id,
    }
  );

  const [deleteVoucher] = useDeleteVoucherMutation();
  const [toggleVoucherStatus] = useToggleVoucherStatusMutation();

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    action: async () => {},
  });

  const voucher = data?.data?.voucher;
  const stats = data?.data?.stats;
  const redemptions = redemptionsData?.data?.redemptions || [];
  const redemptionsMeta = redemptionsData?.data?.meta;

  const handleDelete = () => {
    if (!voucher) return;
    setConfirmDialog({
      open: true,
      title: 'Delete Voucher',
      description: `Are you sure you want to delete voucher "${voucher.code}"? This will also delete the QR code. This action cannot be undone.`,
      action: async () => {
        try {
          await deleteVoucher(voucher.id).unwrap();
          toast.success('Voucher deleted successfully');
          router.push('/vouchers');
        } catch (error) {
          toast.error('Failed to delete voucher');
          throw error;
        }
      },
    });
  };

  const handleToggle = async () => {
    if (!voucher) return;
    try {
      await toggleVoucherStatus(voucher.id).unwrap();
      toast.success(`Voucher ${voucher.is_active ? 'deactivated' : 'activated'} successfully`);
      refetch();
    } catch (error) {
      toast.error(`Failed to ${voucher.is_active ? 'deactivate' : 'activate'} voucher`);
    }
  };

  const copyCode = () => {
    if (!voucher) return;
    navigator.clipboard.writeText(voucher.code);
    toast.success('Voucher code copied to clipboard');
  };

  const downloadQR = () => {
    if (!voucher || !id) return;
    // Open download in new tab
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    window.open(`${apiUrl}/admin/vouchers/${id}/qr`, '_blank');
    toast.success('QR code download started');
  };

  const getStatusBadge = () => {
    if (!voucher) return null;
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
          <Button variant="ghost" onClick={() => router.push('/vouchers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vouchers
          </Button>
          <h1 className="text-3xl font-bold">Loading...</h1>
          <TableSkeleton columns={4} rows={5} />
        </div>
      </Layout>
    );
  }

  if (error || !voucher) {
    return (
      <Layout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => router.push('/vouchers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vouchers
          </Button>
          <div className="text-red-500">Failed to load voucher details</div>
        </div>
      </Layout>
    );
  }

  const usagePercentage = voucher.max_total_uses
    ? (voucher.current_total_uses / voucher.max_total_uses) * 100
    : 0;

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push('/vouchers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vouchers
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push(`/vouchers?edit=${voucher.id}`)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleToggle}
              >
                <Power className="h-4 w-4 mr-2" />
                {voucher.is_active ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* QR Code Card */}
            <div className="border rounded-lg p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code
              </h3>
              {voucher.qr_code_url ? (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-white">
                    <img
                      src={voucher.qr_code_url}
                      alt="Voucher QR Code"
                      className="w-full aspect-square object-contain"
                    />
                  </div>
                  <Button className="w-full" onClick={downloadQR}>
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              ) : (
                <div className="aspect-square bg-muted flex items-center justify-center rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <QrCode className="h-12 w-12 mx-auto mb-2" />
                    <p>No QR Code</p>
                  </div>
                </div>
              )}
            </div>

            {/* Voucher Info Card */}
            <div className="lg:col-span-2 border rounded-lg p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <code className="text-2xl font-mono font-bold">{voucher.code}</code>
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
                  {voucher.description && (
                    <p className="text-muted-foreground">{voucher.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Credit Amount</p>
                  <p className="text-xl font-bold mt-1 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-green-500" />
                    {voucher.amount.toFixed(3)} KWD
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Max Per User</p>
                  <p className="font-medium mt-1">{voucher.max_uses_per_user || 1}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Max Total</p>
                  <p className="font-medium mt-1">{voucher.max_total_uses || 'Unlimited'}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Valid From</p>
                  <p className="font-medium mt-1">{formatDate(voucher.valid_from)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="font-medium mt-1">{formatDate(voucher.valid_until)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium mt-1">{formatDate(voucher.created_at)}</p>
                </div>
              </div>

              {/* Usage Progress */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Total Usage</p>
                  <p className="text-sm font-medium">
                    {voucher.current_total_uses} / {voucher.max_total_uses || '∞'}
                  </p>
                </div>
                {voucher.max_total_uses && (
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
                    <p className="text-sm text-muted-foreground">Total Credited</p>
                    <p className="text-2xl font-bold">{(stats.totalAmountCredited || 0).toFixed(3)} KWD</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Credit</p>
                    <p className="text-2xl font-bold">{(stats.averageAmount || 0).toFixed(3)} KWD</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Redemption History */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Redemption History</h2>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Amount Credited</TableHead>
                    <TableHead>Redeemed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingRedemptions ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : redemptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No redemptions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    redemptions.map((redemption) => (
                      <TableRow key={redemption.id}>
                        <TableCell>
                          <p className="font-medium">{redemption.user_name || 'Unknown'}</p>
                        </TableCell>
                        <TableCell>
                          {redemption.user_phone || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600 font-semibold">
                            +{redemption.amount_credited.toFixed(3)} KWD
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(redemption.redeemed_at)}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Redemptions Pagination */}
            {redemptionsMeta && redemptionsMeta.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={redemptionsMeta.totalPages}
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

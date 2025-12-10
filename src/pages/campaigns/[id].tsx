import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useGetCampaignByIdQuery } from '@/store/api/adminApi';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { formatDate } from '@/lib/utils';

export default function CampaignDetails() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: campaign, isLoading } = useGetCampaignByIdQuery(id as string, {
    skip: !id,
  });

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="p-6">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto p-6">
          <div className="mb-6 flex items-center gap-4">
            <Link href="/campaigns">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Campaigns
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Campaign Details</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{campaign?.title || 'Campaign'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{campaign?.description || 'No description available'}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{campaign?.start_at ? formatDate(campaign.start_at) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{campaign?.end_at ? formatDate(campaign.end_at) : 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={campaign?.status === 1 ? 'default' : 'destructive'}>
                  {campaign?.status === 1 ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

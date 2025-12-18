import { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/store/api/adminApi';
import { CardSkeleton } from '@/components/ui/card-skeleton';
import Image from 'next/image';

export default function Profile() {
  const { admin } = useAuth();
  const { data, isLoading } = useGetProfileQuery(undefined);
  const [updateProfile] = useUpdateProfileMutation();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    avatar: null as File | null,
  });

  useEffect(() => {
    if (data?.data) {
      setFormData({
        name: data.data.name || '',
        avatar: null,
      });
    } else if (admin) {
      setFormData({
        name: admin.name || '',
        avatar: null,
      });
    }
  }, [data, admin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.avatar) {
        data.append('avatar', formData.avatar);
      }

      await updateProfile(data).unwrap();
      toast.success('Profile updated successfully');

      // Update local storage
      const savedAdmin = localStorage.getItem('adminUser');
      if (savedAdmin) {
        const adminData = JSON.parse(savedAdmin);
        adminData.name = formData.name;
        localStorage.setItem('adminUser', JSON.stringify(adminData));
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your admin profile</p>
          </div>
          <CardSkeleton count={1} />
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your admin profile</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={admin?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-muted-foreground text-xs">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Profile Picture</Label>

                  {/* Current Avatar Preview */}
                  {data?.data?.avatar_url && (
                    <div className="mb-4">
                      <Image
                        src={data.data.avatar_url}
                        alt="Current Avatar"
                        width={48}
                        height={48}
                        className="border-border rounded-full border-2 object-cover"
                      />
                      <p className="text-muted-foreground mt-2 text-xs">Current avatar</p>
                    </div>
                  )}
                  <ImageUpload
                    value={formData.avatar || undefined}
                    onChange={(file) => setFormData({ ...formData, avatar: file })}
                    maxSize={2 * 1024 * 1024} // 2MB
                  />
                  <p className="text-muted-foreground text-xs">Maximum file size: 2MB</p>
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

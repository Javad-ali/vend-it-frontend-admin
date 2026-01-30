'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  useGetStepChallengesQuery,
  useCreateStepChallengeMutation,
  useDeleteStepChallengeMutation,
  useToggleStepChallengeStatusMutation,
  useGetMachinesQuery,
} from '@/store/api/adminApi';
import type { StepChallenge, BadgeThreshold } from '@/types/api';
import { Search, Plus, Trash2, Eye, ToggleLeft, ToggleRight, Trophy, Users, Footprints } from 'lucide-react';
import { toast } from 'sonner';

export default function StepChallengesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StepChallenge | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationName: '',
    machineId: '',
    startDate: '',
    endDate: '',
    badgeThresholds: [
      { steps: 1000, badge_name: 'Walker', badge_icon: '🚶' },
      { steps: 5000, badge_name: 'Strider', badge_icon: '🏃' },
      { steps: 10000, badge_name: 'Champion', badge_icon: '🏆' },
      { steps: 25000, badge_name: 'Legend', badge_icon: '⭐' },
    ] as BadgeThreshold[],
  });

  const [machineSearch, setMachineSearch] = useState('');
  const { data: machinesData, isLoading: isLoadingMachines } = useGetMachinesQuery({
    search: machineSearch || undefined,
    limit: 5,
  }, { skip: !isCreateOpen && !machineSearch });


  const { data, isLoading, isFetching } = useGetStepChallengesQuery({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const [createChallenge, { isLoading: isCreating }] = useCreateStepChallengeMutation();
  const [deleteChallenge, { isLoading: isDeleting }] = useDeleteStepChallengeMutation();
  const [toggleStatus] = useToggleStepChallengeStatusMutation();

  const challenges = data?.data?.challenges ?? [];
  const meta = data?.data?.meta;

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Name, start date, and end date are required');
      return;
    }

    try {
      await createChallenge({
        name: formData.name,
        description: formData.description || null,
        machineId: formData.machineId || null,
        locationName: formData.locationName || null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: true,
        badgeThresholds: formData.badgeThresholds,
      }).unwrap();
      
      toast.success('Challenge created successfully');
      setIsCreateOpen(false);
      setFormData({
        name: '',
        description: '',
        locationName: '',
        machineId: '',
        startDate: '',
        endDate: '',
        badgeThresholds: formData.badgeThresholds,
      });
      setMachineSearch('');
    } catch (error) {
      toast.error('Failed to create challenge');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await deleteChallenge(deleteTarget.id).unwrap();
      toast.success('Challenge deleted successfully');
      setDeleteTarget(null);
    } catch (error) {
      toast.error('Failed to delete challenge');
    }
  };

  const handleToggle = async (challenge: StepChallenge) => {
    try {
      await toggleStatus(challenge.id).unwrap();
      toast.success(`Challenge ${challenge.is_active ? 'deactivated' : 'activated'}`);
    } catch (error) {
      toast.error('Failed to toggle challenge status');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getChallengeStatus = (challenge: StepChallenge) => {
    if (!challenge.is_active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-700' };
    const now = new Date();
    const start = new Date(challenge.start_date);
    const end = new Date(challenge.end_date);
    
    if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
    if (now > end) return { label: 'Ended', color: 'bg-gray-100 text-gray-700' };
    return { label: 'Active', color: 'bg-green-100 text-green-700' };
  };

  return (
    <Layout>
      <Head>
        <title>Step Challenges | Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Step Challenges</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage walking challenges and view leaderboards
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Challenge
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search challenges..."
              value={search}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | 'active' | 'inactive');
              setPage(1);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Challenge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Badges
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : challenges.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Footprints className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2">No challenges found</p>
                  </td>
                </tr>
              ) : (
                challenges.map((challenge) => {
                  const status = getChallengeStatus(challenge);
                  return (
                    <tr key={challenge.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {challenge.name}
                        </div>
                        {challenge.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {challenge.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {challenge.location_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div>{formatDate(challenge.start_date)}</div>
                        <div className="text-xs">to {formatDate(challenge.end_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          {(challenge.badge_thresholds || []).slice(0, 4).map((badge, i) => (
                            <span key={i} title={`${badge.badge_name}: ${badge.steps.toLocaleString()} steps`}>
                              {badge.badge_icon}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/step-challenges/${challenge.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggle(challenge)}
                          >
                            {challenge.is_active ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(challenge)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing page {meta.page} of {meta.totalPages} ({meta.total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.totalPages || isFetching}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Step Challenge</DialogTitle>
            <DialogDescription>
              Create a new walking challenge for users to participate in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Challenge name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Challenge description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Machine / Location *</label>
              <div className="space-y-2">
                <Input
                  value={machineSearch}
                  onChange={(e) => setMachineSearch(e.target.value)}
                  placeholder="Search machines..."
                  className="mb-1"
                />
                <div className="max-h-32 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  {isLoadingMachines ? (
                    <div className="p-2 text-center text-xs text-gray-400">Loading machines...</div>
                  ) : machinesData?.data?.machines.length === 0 ? (
                    <div className="p-2 text-center text-xs text-gray-400">No machines found</div>
                  ) : (
                    machinesData?.data?.machines.map((machine) => (
                      <button
                        key={machine.machine_u_id}
                        type="button"
                        onClick={() => {
                          setFormData({ 
                            ...formData, 
                            machineId: machine.id,
                            locationName: machine.machine_name || machine.location || 'Unknown Location'
                          });
                          setMachineSearch(machine.machine_name || machine.location || machine.machine_u_id);
                        }}
                        className={`w-full text-left p-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${formData.machineId === machine.machine_u_id ? 'bg-blue-100 dark:bg-blue-900 border-l-2 border-blue-500' : ''}`}
                      >
                        <div className="font-medium">{machine.machine_name || 'Unnamed Machine'}</div>
                        <div className="text-[10px] text-gray-500">{machine.location || 'No location set'}</div>
                      </button>
                    ))
                  )}
                </div>
                {formData.locationName && (
                  <div className="text-[11px] text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                    <span className="font-semibold">Selected:</span> {formData.locationName}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date *</label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date *</label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Badge Thresholds</label>
              <div className="mt-2 space-y-2">
                {formData.badgeThresholds.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{badge.badge_icon}</span>
                    <span>{badge.badge_name}</span>
                    <span className="ml-auto">{badge.steps.toLocaleString()} steps</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Challenge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Challenge</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

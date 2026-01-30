'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
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
  useGetStepChallengeDetailsQuery,
  useGetStepChallengeLeaderboardQuery,
  useGetStepChallengeParticipantsQuery,
  useUpdateStepChallengeMutation,
  useToggleStepChallengeStatusMutation,
  useFinalizeStepChallengeMutation,
  useGetMachinesQuery,
} from '@/store/api/adminApi';
import type { BadgeThreshold } from '@/types/api';
import { 
  ArrowLeft, 
  Edit, 
  Trophy, 
  Users, 
  Footprints, 
  Medal, 
  Calendar, 
  MapPin,
  ToggleLeft,
  ToggleRight 
} from 'lucide-react';
import { toast } from 'sonner';

export default function StepChallengeDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const challengeId = id as string;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'participants'>('leaderboard');
  const [participantsPage, setParticipantsPage] = useState(1);

  const { data: detailsData, isLoading: detailsLoading } = useGetStepChallengeDetailsQuery(
    challengeId,
    { skip: !challengeId }
  );

  const { data: leaderboardData, isLoading: leaderboardLoading } = useGetStepChallengeLeaderboardQuery(
    { id: challengeId, limit: 50 },
    { skip: !challengeId }
  );

  const { data: participantsData, isLoading: participantsLoading } = useGetStepChallengeParticipantsQuery(
    { id: challengeId, page: participantsPage, limit: 20 },
    { skip: !challengeId }
  );

  const [updateChallenge, { isLoading: isUpdating }] = useUpdateStepChallengeMutation();
  const [toggleStatus] = useToggleStepChallengeStatusMutation();
  const [finalizeChallenge, { isLoading: isFinalizing }] = useFinalizeStepChallengeMutation();

  const challenge = detailsData?.data?.challenge;
  const stats = detailsData?.data?.stats;
  const topThree = detailsData?.data?.topThree ?? [];
  const leaderboard = leaderboardData?.data?.leaderboard ?? [];
  const participants = participantsData?.data?.participants ?? [];
  const participantsMeta = participantsData?.data?.meta;

  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationName: '',
    machineId: '',
  });

  const [machineSearch, setMachineSearch] = useState('');
  const { data: machinesData, isLoading: isLoadingMachines } = useGetMachinesQuery({
    search: machineSearch || undefined,
    limit: 5,
  }, { skip: !isEditOpen && !machineSearch });


  const handleEditOpen = () => {
    if (challenge) {
      setFormData({
        name: challenge.name,
        description: challenge.description ?? '',
        locationName: challenge.location_name ?? '',
        machineId: challenge.machine_id ?? '',
      });
      setMachineSearch(challenge.location_name ?? '');
    }
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!challengeId) return;
    
    try {
      await updateChallenge({
        id: challengeId,
        data: {
          name: formData.name,
          description: formData.description || null,
          machineId: formData.machineId || null,
          locationName: formData.locationName || null,
        },
      }).unwrap();
      
      toast.success('Challenge updated successfully');
      setIsEditOpen(false);
    } catch (error) {
      toast.error('Failed to update challenge');
    }
  };

  const handleToggle = async () => {
    if (!challengeId) return;
    
    try {
      await toggleStatus(challengeId).unwrap();
      toast.success(`Challenge ${challenge?.is_active ? 'deactivated' : 'activated'}`);
    } catch (error) {
      toast.error('Failed to toggle challenge status');
    }
  };

  const handleFinalize = async () => {
    if (!challengeId) return;
    
    try {
      await finalizeChallenge(challengeId).unwrap();
      toast.success('Challenge finalized and ranking badges awarded');
      setIsFinalizeOpen(false);
    } catch (error) {
      toast.error('Failed to finalize challenge');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChallengeStatus = () => {
    if (!challenge) return { label: 'Loading', color: 'bg-gray-100 text-gray-700' };
    if (!challenge.is_active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-700' };
    
    const now = new Date();
    const start = new Date(challenge.start_date);
    const end = new Date(challenge.end_date);
    
    if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
    if (now > end) return { label: 'Ended', color: 'bg-gray-100 text-gray-700' };
    return { label: 'Active', color: 'bg-green-100 text-green-700' };
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (detailsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading challenge details...</p>
        </div>
      </Layout>
    );
  }

  if (!challenge) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">Challenge not found</p>
          <Link href="/step-challenges" className="mt-4 text-blue-600 hover:underline">
            Back to challenges
          </Link>
        </div>
      </Layout>
    );
  }

  const status = getChallengeStatus();

  return (
    <Layout>
      <Head>
        <title>{challenge.name} | Step Challenges</title>
      </Head>

      <div className="space-y-6">
        {/* Back button and header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {challenge.name}
              </h1>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            {challenge.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {challenge.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleToggle}>
              {challenge.is_active ? (
                <>
                  <ToggleRight className="mr-2 h-4 w-4 text-green-600" />
                  Active
                </>
              ) : (
                <>
                  <ToggleLeft className="mr-2 h-4 w-4" />
                  Inactive
                </>
              )}
            </Button>
            {challenge.is_active && (
              <Button variant="outline" size="sm" onClick={() => setIsFinalizeOpen(true)} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                <Trophy className="mr-2 h-4 w-4" />
                Finalize
              </Button>
            )}
            <Button size="sm" onClick={handleEditOpen}>

              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalParticipants ?? 0}
                </p>
                <p className="text-sm text-gray-500">Participants</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <Footprints className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(stats?.totalSteps ?? 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Total Steps</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                <Trophy className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(stats?.averageSteps ?? 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Avg Steps/User</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                <Medal className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(challenge.badge_thresholds ?? []).length}
                </p>
                <p className="text-sm text-gray-500">Badges Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info and badges row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Challenge Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Challenge Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Start:</span>
                <span className="text-gray-900 dark:text-white">{formatDate(challenge.start_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">End:</span>
                <span className="text-gray-900 dark:text-white">{formatDate(challenge.end_date)}</span>
              </div>
              {challenge.location_name && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Location:</span>
                  <span className="text-gray-900 dark:text-white">{challenge.location_name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Badge Thresholds */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Badge Thresholds</h3>
            <div className="space-y-2">
              {(challenge.badge_thresholds ?? []).length === 0 ? (
                <p className="text-sm text-gray-500">No badges configured</p>
              ) : (
                (challenge.badge_thresholds as BadgeThreshold[]).map((badge, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{badge.badge_icon}</span>
                      <span className="text-gray-900 dark:text-white">{badge.badge_name}</span>
                    </div>
                    <span className="text-gray-500">{badge.steps.toLocaleString()} steps</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top 3 Leaders
            </h3>
            <div className="flex justify-center gap-8">
              {topThree.map((entry, i) => (
                <div key={entry.user_id} className="text-center">
                  <div className="text-4xl mb-2">{getRankBadge(i + 1)}</div>
                  <p className="font-medium text-gray-900 dark:text-white">{entry.user_name}</p>
                  <p className="text-sm text-gray-500">{entry.total_steps.toLocaleString()} steps</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs - Leaderboard / Participants */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <div className="flex border-b dark:border-gray-700">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'leaderboard'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('leaderboard')}
            >
              <Trophy className="inline-block mr-2 h-4 w-4" />
              Leaderboard
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'participants'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('participants')}
            >
              <Users className="inline-block mr-2 h-4 w-4" />
              All Participants
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'leaderboard' && (
              <div>
                {leaderboardLoading ? (
                  <p className="text-center text-gray-500 py-8">Loading leaderboard...</p>
                ) : leaderboard.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No participants yet</p>
                ) : (
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 uppercase">
                        <th className="pb-2">Rank</th>
                        <th className="pb-2">User</th>
                        <th className="pb-2 text-right">Total Steps</th>
                        <th className="pb-2 text-right">Last Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {leaderboard.map((entry) => (
                        <tr key={entry.user_id}>
                          <td className="py-3 text-lg">{getRankBadge(entry.rank)}</td>
                          <td className="py-3 font-medium text-gray-900 dark:text-white">
                            {entry.user_name}
                          </td>
                          <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                            {entry.total_steps.toLocaleString()}
                          </td>
                          <td className="py-3 text-right text-sm text-gray-500">
                            {entry.last_update
                              ? new Date(entry.last_update).toLocaleDateString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'participants' && (
              <div>
                {participantsLoading ? (
                  <p className="text-center text-gray-500 py-8">Loading participants...</p>
                ) : participants.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No participants yet</p>
                ) : (
                  <>
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase">
                          <th className="pb-2">User</th>
                          <th className="pb-2">Phone</th>
                          <th className="pb-2 text-right">Steps</th>
                          <th className="pb-2 text-right">Registered</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {participants.map((p) => (
                          <tr key={p.id}>
                            <td className="py-3 font-medium text-gray-900 dark:text-white">
                              {p.user.first_name || p.user.last_name
                                ? `${p.user.first_name ?? ''} ${p.user.last_name ?? ''}`.trim()
                                : 'Unknown'}
                            </td>
                            <td className="py-3 text-gray-600 dark:text-gray-400">
                              {p.user.phone_number}
                            </td>
                            <td className="py-3 text-right text-gray-600 dark:text-gray-400">
                              {p.total_steps.toLocaleString()}
                            </td>
                            <td className="py-3 text-right text-sm text-gray-500">
                              {new Date(p.registered_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {participantsMeta && participantsMeta.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                        <p className="text-sm text-gray-500">
                          Page {participantsMeta.page} of {participantsMeta.totalPages}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setParticipantsPage((p) => Math.max(1, p - 1))}
                            disabled={participantsPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setParticipantsPage((p) => p + 1)}
                            disabled={participantsPage >= participantsMeta.totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Challenge</DialogTitle>
            <DialogDescription>Update challenge details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finalize Dialog */}
      <Dialog open={isFinalizeOpen} onOpenChange={setIsFinalizeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize Challenge</DialogTitle>
            <DialogDescription>
              This will mark the challenge as inactive and award **1st, 2nd, and 3rd Place** badges to the top participants. This action is usually taken after the challenge end date.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFinalizeOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleFinalize} disabled={isFinalizing}>
              {isFinalizing ? 'Finalizing...' : 'Award Rank Badges & Finalize'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

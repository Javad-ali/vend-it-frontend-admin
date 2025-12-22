import { useEffect } from 'react';
import { useGetNotificationsQuery } from '@/store/api/adminApi';
import { toast } from 'sonner';
import type { Notification } from '@/types/api';

let lastChecked = new Date();
const knownNotifications = new Set<string>();

export function useNotifications(pollingInterval: number = 30000) {
  const { data, isLoading, refetch } = useGetNotificationsQuery(
    { limit: 10 },
    {
      pollingInterval, // Poll every 30 seconds
    }
  );

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;

  useEffect(() => {
    // Show toast for new notifications
    if (!isLoading && notifications.length > 0) {
      const newNotifications = notifications.filter((notif: Notification) => {
        const isNew = !notif.read && !knownNotifications.has(notif.id);
        const isRecent = new Date(notif.created_at) > lastChecked;
        return isNew && isRecent;
      });

      newNotifications.forEach((notif: Notification) => {
        knownNotifications.add(notif.id);

        // Show appropriate toast based on type
        switch (notif.type) {
          case 'success':
            toast.success(notif.message);
            break;
          case 'error':
            toast.error(notif.message);
            break;
          case 'warning':
            toast.warning(notif.message);
            break;
          default:
            toast.info(notif.message);
        }
      });

      lastChecked = new Date();
    }
  }, [notifications, isLoading]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refetch,
  };
}

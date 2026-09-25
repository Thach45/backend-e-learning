import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type GetNotificationsParams } from '../api/notifications';
import { useAuthStatus } from './useAuthStatus';
import { useRealtimeSocket } from './useRealtimeSocket';

export const useMyNotifications = (params?: GetNotificationsParams) => {
  const { isAuthenticated } = useAuthStatus();
  return useQuery({
    queryKey: ['notifications', 'list', params],
    queryFn: () => notificationsApi.getMyNotifications(params),
    enabled: isAuthenticated,
  });
};

export const useUnreadNotificationCount = () => {
  const { isAuthenticated } = useAuthStatus();
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

/** Lắng nghe socket realtime: có thông báo mới thì làm mới danh sách + badge. */
export const useNotificationsRealtime = () => {
  const queryClient = useQueryClient();
  useRealtimeSocket((event) => {
    if (event.type === 'notification.new') {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
};

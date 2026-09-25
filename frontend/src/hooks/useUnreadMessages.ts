import { useQuery, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../api/messages';
import { useAuthStatus } from './useAuthStatus';
import { useRealtimeSocket } from './useRealtimeSocket';

/**
 * Số tin chưa đọc cho nút tin nhắn nổi. Cập nhật tức thì nhờ socket (sự kiện message.new / message.read làm mới mọi dữ liệu tin nhắn);
 * vẫn hỏi lại mỗi 60 giây phòng khi socket bị đứt.
 */
export const useUnreadMessages = () => {
  const { isAuthenticated } = useAuthStatus();
  const queryClient = useQueryClient();
  useRealtimeSocket((event) => {
    if (event.type === 'message.new' || event.type === 'message.read') {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });
  const { data } = useQuery({ queryKey: ['messages', 'unread'], queryFn: messagesApi.unread, enabled: isAuthenticated, refetchInterval: 60_000, retry: false });
  return data ?? 0;
};

import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '../api/messages';
import { useAuthStatus } from './useAuthStatus';

/** Số tin chưa đọc cho huy hiệu trên thanh menu (làm mới mỗi 30 giây, chỉ khi đã đăng nhập). */
export const useUnreadMessages = () => {
  const { isAuthenticated } = useAuthStatus();
  const { data } = useQuery({ queryKey: ['messages', 'unread'], queryFn: messagesApi.unread, enabled: isAuthenticated, refetchInterval: 30_000, retry: false });
  return data ?? 0;
};

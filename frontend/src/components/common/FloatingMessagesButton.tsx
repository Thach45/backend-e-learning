import { Link, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useAuthStatus } from '../../hooks/useAuthStatus';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';

/** Nút tin nhắn nổi ở góc dưới bên phải, kèm số tin chưa đọc. Chỉ hiện khi đã đăng nhập, không ở trang tin nhắn và không phải tài khoản chỉ có quyền admin. */
const FloatingMessagesButton = () => {
  const { isAuthenticated, hasRole } = useAuthStatus();
  const { pathname } = useLocation();
  const unread = useUnreadMessages();
  if (!isAuthenticated || (hasRole('ADMIN') && !hasRole('INSTRUCTOR') && !hasRole('CLIENT')) || pathname.startsWith('/messages')) return null;

  return (
    <Link
      to="/messages"
      aria-label={unread > 0 ? `Tin nhắn, ${unread} tin chưa đọc` : 'Tin nhắn'}
      title="Tin nhắn"
      className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-300/50 hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
    >
      <MessageCircle size={26} />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
};

export default FloatingMessagesButton;

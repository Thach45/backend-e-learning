import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import {
  useMyNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useNotificationsRealtime,
} from '../../hooks/useNotifications';
import type { NotificationItem } from '../../api/notifications';

const timeAgo = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

const NotificationRow = ({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
}) => {
  return (
    <button
      onClick={() => {
        if (item.status === 'UNREAD') onRead(item.id);
      }}
      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors ${
        item.status === 'UNREAD' ? 'bg-indigo-50/50' : ''
      }`}
    >
      <span
        className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
          item.status === 'UNREAD' ? 'bg-indigo-600' : 'bg-transparent'
        }`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{item.title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">{item.message}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{timeAgo(item.createdAt)}</p>
      </div>
    </button>
  );
};

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useNotificationsRealtime();
  const { data: unreadData } = useUnreadNotificationCount();
  const { data: notificationsData, isLoading } = useMyNotifications({ page: 1, limit: 8 });
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const unreadCount = unreadData?.unreadCount ?? 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <CheckCheck size={14} /> Đánh dấu đã đọc hết
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : notificationsData?.data && notificationsData.data.length > 0 ? (
              notificationsData.data.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onRead={(id) => markAsReadMutation.mutate(id)}
                />
              ))
            ) : (
              <div className="text-center py-8 px-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có thông báo nào</p>
              </div>
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center py-3 text-xs font-bold text-indigo-600 hover:bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800"
          >
            Xem tất cả thông báo
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

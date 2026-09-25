import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationLink } from '../utils/notificationLink';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { Bell, CheckCheck } from 'lucide-react';
import {
  useMyNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../hooks/useNotifications';

const LIMIT = 15;

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { hasRole } = useAuthStatus();
  const { data, isLoading } = useMyNotifications({ page, limit: LIMIT });
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const items = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Thông báo</h1>
            {typeof data?.unreadCount === 'number' && data.unreadCount > 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{data.unreadCount} thông báo chưa đọc</p>
            )}
          </div>
          {(data?.unreadCount ?? 0) > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              <CheckCheck size={16} /> Đánh dấu đã đọc hết
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.status === 'UNREAD') markAsReadMutation.mutate(item.id);
                    const link = notificationLink(item, hasRole('ADMIN'));
                    if (link) navigate(link);
                  }}
                  className={`w-full text-left px-5 py-4 flex gap-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors ${
                    item.status === 'UNREAD' ? 'bg-indigo-50/40' : ''
                  }`}
                >
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      item.status === 'UNREAD' ? 'bg-indigo-600' : 'bg-transparent'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{item.message}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{formatDateTime(item.createdAt)}</p>
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:bg-slate-950"
                >
                  Trước
                </button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Trang {page}/{totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:bg-slate-950"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
              <Bell size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Chưa có thông báo nào</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Thông báo về bình luận, đơn hàng, tiến độ học sẽ xuất hiện ở đây.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;

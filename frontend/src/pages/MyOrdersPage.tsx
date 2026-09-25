import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Clock, XCircle, Receipt, ArrowRight, Image as ImageIcon, Loader2, BookOpen } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useMyOrders } from '../hooks/useOrders';
import type { OrderStatus } from '../api/orders';
import { PLACEHOLDER_IMAGE } from '../utils/placeholder';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const map = {
    PAID: { color: 'text-emerald-700 bg-emerald-50', label: 'Đã thanh toán', icon: <BadgeCheck size={14} /> },
    PENDING: { color: 'text-amber-700 bg-amber-50', label: 'Chờ xử lý', icon: <Clock size={14} /> },
    FAILED: { color: 'text-rose-700 bg-rose-50', label: 'Thất bại', icon: <XCircle size={14} /> },
  };
  const cfg = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
 
  const { data: orders, isLoading, error } = useMyOrders({ status: filter !== 'ALL' ? filter : undefined });
  
  const filteredOrders = useMemo(() => {
    if (!orders?.data) return [];
    return orders.data;
  }, [orders]);

  const tabs: { key: OrderStatus | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PAID', label: 'Đã thanh toán' },
    { key: 'PENDING', label: 'Chờ xử lý' },
    { key: 'FAILED', label: 'Thất bại' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumbs items={[{ label: 'Trang chủ', href: '/' }, { label: 'Đơn hàng của tôi' }]} />

      <div className="flex items-center justify-between">
        <div>
         
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Theo dõi tình trạng thanh toán</h1>
         
        </div>
        <a href="/checkout" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
          Thanh toán đơn mới <ArrowRight size={14} />
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-2 rounded-full text-sm font-semibold border transition-colors ${
              filter === tab.key
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-100 hover:bg-indigo-50/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
          <p className="text-rose-600 font-semibold">Có lỗi xảy ra khi tải đơn hàng</p>
          <p className="text-sm text-rose-500 mt-1">Vui lòng thử lại sau</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col gap-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{order.id}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Thành tiền</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatVND(order.totalAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {order.orderItems.slice(0, 3).map((item) => (
                    <img
                      key={item.id}
                      src={item.course?.thumbnail || PLACEHOLDER_IMAGE}
                      alt={item.course?.title || 'Course'}
                      className="w-12 h-12 rounded-lg border border-white shadow-sm object-cover"
                    />
                  ))}
                  {order.orderItems.length === 0 && (
                    <div className="w-12 h-12 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <ImageIcon size={16} />
                    </div>
                  )}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{order.orderItems[0]?.course?.title || 'Không có khóa học'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {order.orderItems.length} khóa học • Tổng: {formatVND(order.totalAmount)}
                    {!!order.discountAmount && order.discountAmount > 0 && ` (đã giảm ${formatVND(order.discountAmount)} với mã ${order.couponCode})`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => navigate(`/payment/${order.id}`)}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    Thanh toán ngay <ArrowRight size={14} />
                  </button>
                )}
                <button
                  onClick={() => navigate(`/my-courses`)}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 ml-auto"
                >
                  Học ngay <BookOpen size={14} /> <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Chưa có đơn hàng ở trạng thái này.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;


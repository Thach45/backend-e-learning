import { useState } from 'react';
import { Search, Download, Loader2, AlertCircle, Eye, ChevronDown, X } from 'lucide-react';
import { useAdminOrders, useUpdateOrderStatus, useAdminOrder } from '../../hooks/useOrders';
import type { OrderStatus } from '../../api/orders';

const AdminOrdersPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading, error } = useAdminOrders({
    page,
    limit: 10,
    search: searchTerm || undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus as OrderStatus : undefined,
  });

  const updateStatusMutation = useUpdateOrderStatus();
  const { data: orderDetail } = useAdminOrder(selectedOrderId || '');

  const orders = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    const map: Record<OrderStatus, { label: string; color: string }> = {
      PAID: { label: 'Đã thanh toán', color: 'bg-emerald-50 text-emerald-700' },
      PENDING: { label: 'Chờ xử lý', color: 'bg-amber-50 text-amber-700' },
      FAILED: { label: 'Thất bại', color: 'bg-rose-50 text-rose-700' },
    };
    return map[status] || { label: status, color: 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200' };
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ orderId, body: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-center gap-3">
        <AlertCircle className="text-rose-600" size={24} />
        <div>
          <p className="font-semibold text-rose-800">Có lỗi xảy ra</p>
          <p className="text-sm text-rose-600">Không thể tải danh sách đơn hàng. Vui lòng thử lại.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý đơn hàng</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Theo dõi và quản lý tất cả đơn hàng</p>
        </div>
        <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 flex items-center gap-2">
          <Download size={16} />
          Xuất Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc khóa học..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white dark:bg-slate-900 outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Lọc theo trạng thái:</span>
          {['ALL', 'PAID', 'PENDING', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setSelectedStatus(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                selectedStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {status === 'ALL' ? 'Tất cả' : status === 'PAID' ? 'Đã thanh toán' : status === 'PENDING' ? 'Chờ xử lý' : 'Thất bại'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">Không có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Người dùng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Số khóa học</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Ngày tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((order) => {
                  const statusBadge = getStatusBadge(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-100">{order.id.slice(0, 8)}...</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{order.user?.name || 'N/A'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{order.user?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{order.orderItems.length} khóa học</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {formatVND(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          disabled={updateStatusMutation.isPending}
                          className={`px-2 py-1 rounded-full text-xs font-semibold border-0 ${statusBadge.color} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="PENDING">Chờ xử lý</option>
                          <option value="PAID">Đã thanh toán</option>
                          <option value="FAILED">Thất bại</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(order.createdAt)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Trang {page} / {totalPages} • Tổng {data?.total || 0} đơn hàng
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderId && orderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Chi tiết đơn hàng</h2>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Mã đơn hàng</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{orderDetail.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Trạng thái</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(orderDetail.status).color}`}>
                    {getStatusBadge(orderDetail.status).label}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Người mua</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{orderDetail.user?.name || 'N/A'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{orderDetail.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ngày tạo</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{formatDate(orderDetail.createdAt)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Khóa học trong đơn</h3>
                <div className="space-y-3">
                  {orderDetail.orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
                      {item.course?.thumbnail && (
                        <img
                          src={item.course.thumbnail}
                          alt={item.course.title}
                          className="w-20 h-14 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{item.course?.title || 'N/A'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.course?.instructor?.name || 'N/A'}</p>
                        <p className="text-sm font-semibold text-indigo-600 mt-1">{formatVND(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                {!!orderDetail.discountAmount && orderDetail.discountAmount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-sm text-slate-600 dark:text-slate-300">
                    <span>
                      Mã giảm giá <strong className="text-slate-800 dark:text-slate-100">{orderDetail.couponCode}</strong>
                    </span>
                    <span className="font-semibold text-emerald-600">-{formatVND(orderDetail.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100">Tổng tiền</span>
                  <span className="text-2xl font-bold text-indigo-600">{formatVND(orderDetail.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;


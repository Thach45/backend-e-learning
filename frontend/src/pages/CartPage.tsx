import { Trash2, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useGetCart, useRemoveFromCart } from '../hooks/useCart';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const CartPage = () => {
  const { data: cartData, isLoading: cartLoading, error: cartError } = useGetCart();
  const removeFromCartMutation = useRemoveFromCart();

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin h-12 w-12 text-indigo-600" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-4">Đang tải giỏ hàng...</h2>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Đã xảy ra lỗi khi tải giỏ hàng</p>
          <Link to="/" className="text-indigo-600 hover:underline">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const cartItems = cartData?.cart?.cartItems || [];
  const itemCount = cartData?.itemCount || 0;
  const subtotal = cartData?.subtotal || 0;
  const total = cartData?.total || 0;

  const handleRemoveFromCart = (courseId: string, courseTitle: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${courseTitle}" khỏi giỏ hàng?`)) {
      removeFromCartMutation.mutate(courseId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-2">
        <Breadcrumbs items={[{ label: 'Trang chủ', href: '/' }, { label: 'Giỏ hàng' }]} />
      </div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Giỏ hàng của bạn</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{itemCount} khóa học</p>
        </div>
        <Link to="/courses" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
          Tiếp tục mua sắm
        </Link>
      </div>

      {itemCount === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Giỏ hàng của bạn đang trống</p>
          <Link
            to="/courses"
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Khám phá khóa học
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const course = item.course;
              if (!course) return null;

              const finalPrice = course.salePrice || course.price;
              const originalPrice = course.salePrice ? course.price : null;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={course.title}
                    className="w-28 h-20 object-cover rounded-xl border border-slate-100 dark:border-slate-800"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{course.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{course.instructor?.name || 'N/A'}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-lg font-bold text-indigo-600">{formatVND(finalPrice)}</span>
                      {originalPrice && (
                        <span className="text-xs line-through text-slate-400 dark:text-slate-500">{formatVND(originalPrice)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFromCart(item.courseId, course.title)}
                    disabled={removeFromCartMutation.isPending}
                    className="text-slate-400 dark:text-slate-500 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Xóa khỏi giỏ hàng"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4 h-fit">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tổng thanh toán</h2>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 text-base font-bold text-slate-800 dark:text-slate-100">
                <span>Thành tiền</span>
                <span className="text-indigo-600">{formatVND(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard size={18} />
              Thanh toán
            </Link>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Bảo mật thanh toán • Hỗ trợ hoàn tiền trong 7 ngày</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;


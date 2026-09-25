import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Tag, Loader2, X } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useGetCart } from '../hooks/useCart';
import { useCreateOrder } from '../hooks/useOrders';
import { useValidateCoupon } from '../hooks/useCoupons';
import type { ValidatedCoupon } from '../api/coupons';
import { toast } from 'sonner';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<ValidatedCoupon | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: cartData, isLoading: cartLoading } = useGetCart();
  const createOrderMutation = useCreateOrder();
  const validateCouponMutation = useValidateCoupon();

  const cartItems = cartData?.cart?.cartItems || [];
  const subtotal = cartData?.subtotal || 0;

  // Số tiền giảm do server tính; chỉ dùng kết quả nếu vẫn khớp với tạm tính hiện tại của giỏ hàng.
  const couponDiscount = appliedCoupon && appliedCoupon.subtotal === subtotal ? appliedCoupon.discountAmount : 0;
  const total = subtotal - couponDiscount;

  const handleApplyVoucher = () => {
    const code = voucher.trim();
    if (!code) {
      setError('Vui lòng nhập mã giảm giá');
      setAppliedCoupon(null);
      return;
    }
    validateCouponMutation.mutate(code, {
      onSuccess: (result) => {
        setAppliedCoupon(result);
        setError(null);
      },
      onError: (err) => {
        const message = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
        setError((Array.isArray(message) ? message[0] : message) || 'Mã không hợp lệ hoặc đã hết hạn');
        setAppliedCoupon(null);
      },
    });
  };

  const handleRemoveVoucher = () => {
    setAppliedCoupon(null);
    setVoucher('');
    setError(null);
  };

  const handleCreateOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống');
      navigate('/cart');
      return;
    }

    createOrderMutation.mutate(couponDiscount > 0 && appliedCoupon ? { couponCode: appliedCoupon.code } : {}, {
      onSuccess: (order) => {
        navigate(`/payment/${order.id}`);
      },
    });
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="inline-block animate-spin h-12 w-12 text-indigo-600" />
          <p className="mt-4 text-slate-500 dark:text-slate-400">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (!cartData || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Giỏ hàng trống</p>
          <button
            onClick={() => navigate('/cart')}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Quay lại giỏ hàng
          </button>
        </div>
      </div>
    );
  }

  // Giao diện checkout
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: 'Trang chủ', href: '/' }, { label: 'Giỏ hàng', href: '/cart' }, { label: 'Thanh toán' }]} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {/* <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Thông tin thanh toán</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Email bắt buộc để kích hoạt và tham gia lớp học</p>
              </div>
              <Lock size={16} className="text-emerald-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Họ và tên</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-indigo-100">
                  <User size={16} className="text-indigo-600" />
                  <input className="flex-1 text-sm bg-transparent outline-none" placeholder="Họ và tên" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">Email <span className="text-rose-500">*</span></label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-200 bg-indigo-50 focus-within:ring-2 focus-within:ring-indigo-200">
                  <Mail size={16} className="text-indigo-600" />
                  <input className="flex-1 text-sm bg-transparent outline-none" placeholder="Email để kích hoạt khóa học" required />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Dùng email này để đăng nhập và nhận thông báo lớp học.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Số điện thoại</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-indigo-100">
                  <Phone size={16} className="text-indigo-600" />
                  <input className="flex-1 text-sm bg-transparent outline-none" placeholder="Số điện thoại" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quốc gia/Khu vực</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 focus-within:ring-2 focus-within:ring-indigo-100">
                  <MapPin size={16} className="text-indigo-600" />
                  <input className="flex-1 text-sm bg-transparent outline-none" placeholder="Việt Nam" />
                </div>
              </div>
            </div>
          </div> */}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Phương thức thanh toán</h2>
              <span className="text-xs font-semibold text-amber-600">Chỉ hỗ trợ Chuyển khoản • Others coming soon</span>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-indigo-200 rounded-xl bg-indigo-50 cursor-pointer">
                <input type="radio" name="payment" defaultChecked className="text-indigo-600" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">Chuyển khoản ngân hàng</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Xác nhận tự động sau khi nhận được giao dịch</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl opacity-60 cursor-not-allowed">
                <input type="radio" name="payment" disabled className="text-slate-400 dark:text-slate-500" />
                <div>
                  <p className="font-semibold text-slate-500 dark:text-slate-400">Thẻ ngân hàng / Visa / Master</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">Coming soon</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl opacity-60 cursor-not-allowed">
                <input type="radio" name="payment" disabled className="text-slate-400 dark:text-slate-500" />
                <div>
                  <p className="font-semibold text-slate-500 dark:text-slate-400">Ví điện tử</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">Momo, ZaloPay, VNPay (coming soon)</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4 h-fit">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Đơn hàng</h2>

          <div className="space-y-3 max-h-64 overflow-auto">
            {cartItems.map((item) => {
              const course = item.course;
              if (!course) return null;
              const finalPrice = course.salePrice || course.price;
              return (
                <div key={item.id} className="flex gap-3">
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-14 object-cover rounded-lg border border-slate-100 dark:border-slate-800"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">{course.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{course.instructor?.name || 'N/A'}</p>
                    <p className="text-sm font-bold text-indigo-600 mt-1">{formatVND(finalPrice)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Tag size={14} className="text-indigo-600" /> Mã giảm giá
            </label>
            {appliedCoupon && couponDiscount > 0 ? (
              <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{appliedCoupon.code}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">
                    Giảm {formatVND(couponDiscount)}
                    {appliedCoupon.type === 'PERCENT' ? ` (${appliedCoupon.value}%)` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="p-1 text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg"
                  aria-label="Bỏ mã giảm giá"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={voucher}
                  onChange={(e) => setVoucher(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                  placeholder="Nhập mã"
                  className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-indigo-100 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  disabled={validateCouponMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-50"
                >
                  {validateCouponMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Áp dụng'}
                </button>
              </div>
            )}
            {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Mã được tính là đã dùng ngay khi bạn tạo đơn. Nếu đơn hết hạn thanh toán, đơn sẽ tự hủy và mã được hoàn lại.
            </p>
          </div>

          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{formatVND(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between">
                <span>Giảm giá ({appliedCoupon?.code})</span>
                <span className="font-semibold text-emerald-600">-{formatVND(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800 text-base font-bold text-slate-800 dark:text-slate-100">
              <span>Thành tiền</span>
              <span className="text-indigo-600">{formatVND(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCreateOrder}
            disabled={createOrderMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createOrderMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CreditCard size={18} />
                Xác nhận & Thanh toán
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Bảo mật thanh toán • Hoàn tiền trong 7 ngày theo chính sách Order schema</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

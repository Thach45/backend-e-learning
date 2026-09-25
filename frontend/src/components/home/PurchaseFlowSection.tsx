import { CreditCard, GraduationCap, MonitorPlay, ShoppingCart } from 'lucide-react';

const PurchaseFlowSection = () => {
  const steps = [
    { icon: MonitorPlay, title: 'Chọn khóa', desc: 'Thêm vào giỏ hàng' },
    { icon: ShoppingCart, title: 'Giỏ hàng', desc: 'Kiểm tra và áp mã' },
    { icon: CreditCard, title: 'Thanh toán', desc: 'Thẻ, ví, chuyển khoản' },
    { icon: GraduationCap, title: 'Học ngay', desc: 'Truy cập My Learning' },
  ];

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Mua khóa học nhanh</p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">4 bước đơn giản: Chọn → Giỏ hàng → Thanh toán → Học ngay</h3>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-950 transition-colors">
            Xem giỏ hàng <ShoppingCart size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-white dark:bg-slate-900 transition-colors flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <step.icon size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{step.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PurchaseFlowSection;


import { useState } from 'react';
import { Ticket, Plus, Pencil, Trash2, Loader2, Search, X } from 'lucide-react';
import { useAdminCoupons, useDeleteCoupon, useSaveCoupon } from '../../hooks/useCoupons';
import type { Coupon, CouponFormBody, CouponType } from '../../api/coupons';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
const formatDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '—');

// <input type="datetime-local"> dùng giờ địa phương, không có múi giờ
const toLocalInput = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null);

const inputCls =
  'w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1';

const statusOf = (c: Coupon) => {
  if (!c.isActive) return { text: 'Đã tắt', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' };
  if (c.expiresAt && new Date(c.expiresAt) < new Date())
    return { text: 'Hết hạn', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' };
  if (c.startsAt && new Date(c.startsAt) > new Date())
    return { text: 'Chưa bắt đầu', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' };
  if (c.usageLimit !== null && c.usageLimit !== undefined && c.usedCount >= c.usageLimit)
    return { text: 'Hết lượt', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' };
  return { text: 'Đang chạy', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' };
};

type FormState = {
  code: string;
  description: string;
  type: CouponType;
  value: string;
  maxDiscount: string;
  minOrderAmount: string;
  startsAt: string;
  expiresAt: string;
  usageLimit: string;
  perUserLimit: string;
  courseIds: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  code: '',
  description: '',
  type: 'PERCENT',
  value: '10',
  maxDiscount: '',
  minOrderAmount: '',
  startsAt: '',
  expiresAt: '',
  usageLimit: '',
  perUserLimit: '1',
  courseIds: '',
  isActive: true,
};

const toForm = (c: Coupon): FormState => ({
  code: c.code,
  description: c.description ?? '',
  type: c.type,
  value: String(c.value),
  maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
  minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : '',
  startsAt: toLocalInput(c.startsAt),
  expiresAt: toLocalInput(c.expiresAt),
  usageLimit: c.usageLimit ? String(c.usageLimit) : '',
  perUserLimit: String(c.perUserLimit),
  courseIds: c.courseIds.join(', '),
  isActive: c.isActive,
});

const numOrNull = (v: string) => (v.trim() === '' ? null : Number(v));

const CouponModal = ({ coupon, onClose }: { coupon: Coupon | null; onClose: () => void }) => {
  const [form, setForm] = useState<FormState>(coupon ? toForm(coupon) : emptyForm);
  const save = useSaveCoupon();
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: CouponFormBody = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      type: form.type,
      value: Number(form.value),
      maxDiscount: form.type === 'PERCENT' ? numOrNull(form.maxDiscount) : null,
      minOrderAmount: numOrNull(form.minOrderAmount),
      startsAt: fromLocalInput(form.startsAt),
      expiresAt: fromLocalInput(form.expiresAt),
      usageLimit: numOrNull(form.usageLimit),
      perUserLimit: Number(form.perUserLimit) || 1,
      courseIds: form.courseIds
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
      isActive: form.isActive,
    };
    save.mutate({ id: coupon?.id, body }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 overflow-y-auto">
      <form
        onSubmit={submit}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 my-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {coupon ? `Sửa mã ${coupon.code}` : 'Tạo mã giảm giá'}
          </h2>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600" aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Mã *</label>
            <input
              className={`${inputCls} uppercase`}
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              disabled={!!coupon}
              required
              minLength={3}
              maxLength={32}
              pattern="[A-Za-z0-9_\-]+"
              placeholder="VD: SUMMER20"
            />
            {coupon && <p className="text-[11px] text-slate-400 mt-1">Không thể đổi mã sau khi tạo.</p>}
          </div>
          <div>
            <label className={labelCls}>Mô tả</label>
            <input className={inputCls} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={200} />
          </div>

          <div>
            <label className={labelCls}>Loại giảm *</label>
            <select className={inputCls} value={form.type} onChange={(e) => set('type', e.target.value as CouponType)}>
              <option value="PERCENT">Theo phần trăm (%)</option>
              <option value="FIXED">Số tiền cố định (VNĐ)</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Giá trị * {form.type === 'PERCENT' ? '(1–100)' : '(VNĐ)'}</label>
            <input
              type="number"
              className={inputCls}
              value={form.value}
              onChange={(e) => set('value', e.target.value)}
              required
              min={1}
              max={form.type === 'PERCENT' ? 100 : undefined}
            />
          </div>

          {form.type === 'PERCENT' && (
            <div>
              <label className={labelCls}>Giảm tối đa (VNĐ)</label>
              <input type="number" min={1} className={inputCls} value={form.maxDiscount} onChange={(e) => set('maxDiscount', e.target.value)} placeholder="Không giới hạn" />
            </div>
          )}
          <div>
            <label className={labelCls}>Đơn tối thiểu (VNĐ)</label>
            <input type="number" min={0} className={inputCls} value={form.minOrderAmount} onChange={(e) => set('minOrderAmount', e.target.value)} placeholder="Không yêu cầu" />
          </div>

          <div>
            <label className={labelCls}>Bắt đầu</label>
            <input type="datetime-local" className={inputCls} value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Hết hạn</label>
            <input type="datetime-local" className={inputCls} value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Tổng lượt dùng tối đa</label>
            <input type="number" min={1} className={inputCls} value={form.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} placeholder="Không giới hạn" />
          </div>
          <div>
            <label className={labelCls}>Lượt tối đa / người dùng *</label>
            <input type="number" min={1} className={inputCls} value={form.perUserLimit} onChange={(e) => set('perUserLimit', e.target.value)} required />
          </div>
        </div>

        <div>
          <label className={labelCls}>Chỉ áp dụng cho khóa học (ID, cách nhau bằng dấu phẩy)</label>
          <textarea
            className={inputCls}
            rows={2}
            value={form.courseIds}
            onChange={(e) => set('courseIds', e.target.value)}
            placeholder="Để trống = áp dụng cho mọi khóa học"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          Đang kích hoạt
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
            Hủy
          </button>
          <button
            type="submit"
            disabled={save.isPending}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {save.isPending && <Loader2 size={14} className="animate-spin" />} Lưu
          </button>
        </div>
      </form>
    </div>
  );
};

const AdminCouponsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'' | 'active' | 'inactive' | 'expired'>('');
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading } = useAdminCoupons({ page, limit: 10, search: search || undefined, status: status || undefined });
  const deleteCoupon = useDeleteCoupon();
  const saveCoupon = useSaveCoupon();
  const coupons = data?.data ?? [];

  const toggleActive = (c: Coupon) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, usedCount, createdAt, ...rest } = c;
    saveCoupon.mutate({ id, body: { ...rest, isActive: !c.isActive } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <Ticket size={28} className="text-indigo-600" /> Mã giảm giá
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Tạo và quản lý mã giảm giá áp dụng khi thanh toán</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700"
        >
          <Plus size={18} /> Tạo mã
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo mã hoặc mô tả..."
            className={`${inputCls} pl-9`}
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as typeof status);
            setPage(1);
          }}
          className={`${inputCls} w-auto`}
        >
          <option value="">Tất cả</option>
          <option value="active">Đang kích hoạt</option>
          <option value="inactive">Đã tắt</option>
          <option value="expired">Đã hết hạn</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  {['Mã', 'Giảm', 'Điều kiện', 'Thời hạn', 'Đã dùng', 'Trạng thái', ''].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      Chưa có mã giảm giá nào
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => {
                    const st = statusOf(c);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                        <td className="px-6 py-4">
                          <code className="font-bold text-sm text-slate-800 dark:text-slate-100">{c.code}</code>
                          {c.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.description}</p>}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {c.type === 'PERCENT' ? `${c.value}%` : formatVND(c.value)}
                          {c.type === 'PERCENT' && c.maxDiscount ? (
                            <p className="text-xs text-slate-500">tối đa {formatVND(c.maxDiscount)}</p>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                          <p>Đơn tối thiểu: {c.minOrderAmount ? formatVND(c.minOrderAmount) : '—'}</p>
                          <p>{c.perUserLimit} lượt/người</p>
                          <p>{c.courseIds.length ? `${c.courseIds.length} khóa học` : 'Mọi khóa học'}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {formatDate(c.startsAt)} → {formatDate(c.expiresAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {c.usedCount}
                          {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleActive(c)}
                            disabled={saveCoupon.isPending}
                            title="Bấm để bật/tắt"
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.cls}`}
                          >
                            {st.text}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => setEditing(c)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg" aria-label="Sửa">
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Xóa mã ${c.code}?`)) deleteCoupon.mutate(c.id);
                              }}
                              disabled={deleteCoupon.isPending}
                              className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg disabled:opacity-50"
                              aria-label="Xóa"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
            <span>
              {coupons.length} / {data.total} mã
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-50">
                Trước
              </button>
              <span>
                Trang {page} / {data.totalPages}
              </span>
              <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-50">
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {(creating || editing) && (
        <CouponModal
          coupon={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminCouponsPage;

import { useEffect, useState } from 'react';
import { Loader2, Settings, Share2, Wrench, AlertTriangle } from 'lucide-react';
import { useAdminSiteSettings, useUpdateSiteSettings } from '../../hooks/useSiteSettings';
import { SOCIAL_FIELDS, type SocialKey } from '../../api/siteSettings';

const inputClass =
  'w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500';

// datetime-local cần giờ địa phương dạng "YYYY-MM-DDTHH:mm"
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const AdminSettingsPage = () => {
  const { data, isLoading } = useAdminSiteSettings();
  const update = useUpdateSiteSettings();

  const [social, setSocial] = useState<Record<SocialKey, string>>({} as Record<SocialKey, string>);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [until, setUntil] = useState('');

  useEffect(() => {
    if (!data) return;
    setSocial(Object.fromEntries(SOCIAL_FIELDS.map((f) => [f.key, data[f.key] ?? ''])) as Record<SocialKey, string>);
    setMessage(data.maintenanceMessage ?? '');
    setUntil(toLocalInput(data.maintenanceUntil));
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600" />
      </div>
    );
  }

  const saveSocial = () => {
    const bad = SOCIAL_FIELDS.find((f) => social[f.key]?.trim() && !social[f.key].trim().startsWith('https://'));
    if (bad) {
      setSocialError(`Liên kết ${bad.label} phải bắt đầu bằng https://`);
      return;
    }
    setSocialError(null);
    update.mutate(Object.fromEntries(SOCIAL_FIELDS.map((f) => [f.key, social[f.key]?.trim() || null])));
  };

  const saveMaintenanceDetails = () =>
    update.mutate({
      maintenanceMessage: message.trim() || null,
      maintenanceUntil: until ? new Date(until).toISOString() : null,
    });

  const toggleMaintenance = () => {
    const next = !data.maintenanceEnabled;
    const ok = window.confirm(
      next
        ? 'BẬT chế độ bảo trì?\n\nNgười dùng thường sẽ không truy cập được website (chỉ admin vẫn dùng bình thường). Webhook thanh toán vẫn hoạt động.'
        : 'TẮT chế độ bảo trì và mở lại website cho mọi người?',
    );
    if (!ok) return;
    update.mutate({
      maintenanceEnabled: next,
      maintenanceMessage: message.trim() || null,
      maintenanceUntil: until ? new Date(until).toISOString() : null,
    });
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <Settings size={28} className="text-indigo-600" /> Cài đặt hệ thống
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Liên kết mạng xã hội và chế độ bảo trì</p>
      </div>

      {/* Bảo trì */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Wrench size={18} className="text-amber-600" /> Chế độ bảo trì
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Khi bật, người dùng thường thấy màn hình bảo trì ở mọi trang. Admin vẫn đăng nhập và thao tác bình thường.
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
              data.maintenanceEnabled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {data.maintenanceEnabled ? 'ĐANG BẢO TRÌ' : 'Đang hoạt động'}
          </span>
        </div>

        {data.maintenanceEnabled && (
          <div className="flex gap-2 items-start text-sm bg-red-50 text-red-800 border border-red-200 rounded-xl p-3">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            Website đang đóng với người dùng thường. Nhớ tắt sau khi bảo trì xong.
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Thông báo hiển thị</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Ví dụ: Chúng tôi đang nâng cấp hệ thống, sẽ hoạt động lại trong ít phút."
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
            Dự kiến hoạt động lại <span className="font-normal text-slate-400">(chỉ để hiển thị, không tự mở)</span>
          </label>
          <input type="datetime-local" value={until} onChange={(e) => setUntil(e.target.value)} className={inputClass} />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={toggleMaintenance}
            disabled={update.isPending}
            className={`px-5 py-2.5 rounded-xl font-semibold text-white disabled:opacity-50 ${
              data.maintenanceEnabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {data.maintenanceEnabled ? 'Tắt bảo trì' : 'Bật bảo trì'}
          </button>
          <button
            onClick={saveMaintenanceDetails}
            disabled={update.isPending}
            className="px-5 py-2.5 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            Lưu nội dung thông báo
          </button>
        </div>
      </section>

      {/* Mạng xã hội */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Share2 size={18} className="text-indigo-600" /> Liên kết mạng xã hội
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hiển thị ở chân trang. Để trống thì biểu tượng đó sẽ được ẩn. Chỉ nhận liên kết bắt đầu bằng <code>https://</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">{f.label}</label>
              <input
                type="url"
                value={social[f.key] ?? ''}
                onChange={(e) => setSocial({ ...social, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className={inputClass}
              />
            </div>
          ))}
        </div>
        {socialError && <p className="text-sm text-red-600">{socialError}</p>}

        <button
          onClick={saveSocial}
          disabled={update.isPending}
          className="px-5 py-2.5 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {update.isPending ? 'Đang lưu...' : 'Lưu liên kết'}
        </button>
      </section>
    </div>
  );
};

export default AdminSettingsPage;

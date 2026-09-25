import { RefreshCw, Wrench } from 'lucide-react';
import SocialLinks from './SocialLinks';

interface Props {
  message?: string | null;
  until?: string | null;
  onRetry: () => void;
}

/** Layout toàn màn hình thay cho toàn bộ ứng dụng khi hệ thống đang bảo trì (chỉ admin mới vượt qua được). */
const MaintenanceLayout = ({ message, until, onRetry }: Props) => {
  const untilDate = until ? new Date(until) : null;
  const validUntil = untilDate && !Number.isNaN(untilDate.getTime()) ? untilDate : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-6 text-center">
      <img src="/assets/image.png" alt="U Đê Mê" className="w-16 h-16 rounded-2xl object-cover shadow-lg mb-8" />
      <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
        <Wrench size={36} />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3">Hệ thống đang bảo trì</h1>
      <p className="max-w-lg text-slate-600 dark:text-slate-300 leading-relaxed">
        {message || 'Chúng tôi đang nâng cấp hệ thống để phục vụ bạn tốt hơn. Vui lòng quay lại sau ít phút.'}
      </p>
      {validUntil && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Dự kiến hoạt động lại lúc <strong>{validUntil.toLocaleString('vi-VN')}</strong>
        </p>
      )}
      <button
        onClick={onRetry}
        className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
      >
        <RefreshCw size={18} /> Thử lại
      </button>
      <div className="mt-10 text-slate-400 dark:text-slate-500 text-sm">
        <SocialLinks className="flex gap-5 justify-center" />
      </div>
    </div>
  );
};

export default MaintenanceLayout;

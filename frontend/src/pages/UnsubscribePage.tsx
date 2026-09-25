import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, MailX } from 'lucide-react';
import { emailCampaignsApi } from '../api/emailCampaigns';
import { useSEO } from '../hooks/useSEO';

/** Trang ngừng nhận thư thông báo, mở từ liên kết cuối mỗi thư. Không cần đăng nhập (token ký sẵn trong liên kết). */
const UnsubscribePage = () => {
  useSEO({ title: 'Ngừng nhận thư' });
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<'loading' | 'invalid' | 'ready' | 'done' | 'resubscribed'>('loading');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setState('invalid'); return; }
    emailCampaignsApi.unsubscribeInfo(token)
      .then((r) => { setEmail(r.email); setState(r.optedOut ? 'done' : 'ready'); })
      .catch(() => setState('invalid'));
  }, [token]);

  const act = async (fn: (t: string) => Promise<unknown>, next: 'done' | 'resubscribed') => {
    setBusy(true);
    try { await fn(token); setState(next); } catch { setState('invalid'); } finally { setBusy(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {state === 'loading' && <Loader2 className="animate-spin text-indigo-600 mx-auto" />}
      {state === 'invalid' && (
        <>
          <MailX size={44} className="mx-auto text-slate-400 mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">Liên kết không hợp lệ</h1>
          <p className="text-slate-500 mt-2">Liên kết đã bị chỉnh sửa hoặc không đúng. Bạn có thể đăng nhập rồi tắt nhận thư trong <Link to="/account/settings" className="text-indigo-600 hover:underline">Cài đặt tài khoản</Link>.</p>
        </>
      )}
      {state === 'ready' && (
        <>
          <MailX size={44} className="mx-auto text-indigo-600 mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">Ngừng nhận thư thông báo?</h1>
          <p className="text-slate-500 mt-2">Địa chỉ <strong>{email}</strong> sẽ không nhận thư thông báo từ giảng viên và ban quản trị nữa. Bạn vẫn nhận các thư cần thiết như mã xác thực và xác nhận đơn hàng.</p>
          <button onClick={() => act(emailCampaignsApi.unsubscribe, 'done')} disabled={busy} className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50">
            {busy ? 'Đang xử lý...' : 'Ngừng nhận thư'}
          </button>
        </>
      )}
      {state === 'done' && (
        <>
          <CheckCircle2 size={44} className="mx-auto text-emerald-600 mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">Đã ngừng nhận thư thông báo</h1>
          <p className="text-slate-500 mt-2"><strong>{email}</strong> sẽ không nhận thư thông báo nữa.</p>
          <button onClick={() => act(emailCampaignsApi.resubscribe, 'resubscribed')} disabled={busy} className="mt-6 text-indigo-600 hover:underline disabled:opacity-50">Bấm nhầm? Đăng ký nhận lại</button>
        </>
      )}
      {state === 'resubscribed' && (
        <>
          <CheckCircle2 size={44} className="mx-auto text-emerald-600 mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">Đã bật lại nhận thư</h1>
          <p className="text-slate-500 mt-2">Bạn sẽ tiếp tục nhận thư thông báo.</p>
        </>
      )}
    </div>
  );
};

export default UnsubscribePage;

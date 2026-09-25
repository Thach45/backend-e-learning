import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Activity, CheckCircle2, Loader2, RefreshCw, Trash2, XCircle } from 'lucide-react';
import { queuesApi, type JobState } from '../../api/queues';

const Dot = ({ ok }: { ok: boolean }) => (ok ? <CheckCircle2 size={18} className="text-emerald-600" /> : <XCircle size={18} className="text-red-600" />);
const fmtUptime = (s: number) => (s >= 86400 ? `${Math.floor(s / 86400)} ngày ${Math.floor((s % 86400) / 3600)} giờ` : s >= 3600 ? `${Math.floor(s / 3600)} giờ ${Math.floor((s % 3600) / 60)} phút` : `${Math.floor(s / 60)} phút`);

const AdminSystemPage = () => {
  const qc = useQueryClient();
  const [queue, setQueue] = useState('mail');
  const [state, setState] = useState<JobState>('failed');

  const sys = useQuery({ queryKey: ['system-status'], queryFn: queuesApi.system, refetchInterval: 15_000 });
  const overview = useQuery({ queryKey: ['queues'], queryFn: queuesApi.overview, refetchInterval: 10_000 });
  const jobs = useQuery({ queryKey: ['queue-jobs', queue, state], queryFn: () => queuesApi.jobs(queue, state), refetchInterval: 10_000 });

  const refresh = () => { qc.invalidateQueries({ queryKey: ['queues'] }); qc.invalidateQueries({ queryKey: ['queue-jobs'] }); };
  const fail = () => toast.error('Thao tác thất bại.');
  const retry = useMutation({ mutationFn: (id: string) => queuesApi.retry(queue, id), onSuccess: () => { toast.success('Đã đưa vào hàng đợi thử lại.'); refresh(); }, onError: fail });
  const remove = useMutation({ mutationFn: (id: string) => queuesApi.remove(queue, id), onSuccess: () => { toast.success('Đã xoá job.'); refresh(); }, onError: fail });
  const retryAll = useMutation({ mutationFn: () => queuesApi.retryAll(queue), onSuccess: (r) => { toast.success(`Đã thử lại ${r.retried} job.`); refresh(); }, onError: fail });

  const s = sys.data;
  const mailPct = s ? Math.min(100, Math.round((s.mail.sentToday / Math.max(1, s.mail.dailyCap)) * 100)) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3"><Activity size={28} className="text-indigo-600" /> Tình trạng hệ thống</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Hàng đợi gửi email, hết hạn đơn hàng và hạn mức mail trong ngày. Tự làm mới mỗi 10 giây.</p>
      </div>

      {s && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 text-sm">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Dịch vụ</p>
            <p className="flex items-center gap-2"><Dot ok={s.database.ok} /> Cơ sở dữ liệu {s.database.ms !== null && <span className="text-slate-400">({s.database.ms}ms)</span>}</p>
            <p className="flex items-center gap-2"><Dot ok={s.redis} /> Redis</p>
            <p className="flex items-center gap-2"><Dot ok={s.mail.resendConfigured} /> Gửi mail (Resend)</p>
            <p className="flex items-center gap-2"><Dot ok={s.mail.webhookConfigured} /> Webhook Resend (bounce/spam)</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 text-sm">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Hạn mức mail hôm nay (UTC)</p>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${mailPct >= 90 ? 'bg-red-500' : mailPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${mailPct}%` }} /></div>
            <p>Đã gửi <strong>{s.mail.sentToday}</strong>/{s.mail.dailyCap}. Dành riêng cho OTP/đơn hàng: {s.mail.transactionalReserve}. Chiến dịch còn gửi được: <strong>{s.mail.campaignBudgetLeft}</strong> mail.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 text-sm">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Máy chủ ứng dụng</p>
            <p>Chạy liên tục: {fmtUptime(s.process.uptimeSeconds)}</p>
            <p>RAM: {s.process.rssMb} MB (heap {s.process.heapUsedMb} MB)</p>
            <p>Node {s.process.node}</p>
            {s.activeUsers !== null && <p>Người dùng đang hoạt động: {s.activeUsers}</p>}
          </div>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Hàng đợi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {overview.data?.map((q) => (
            <button key={q.name} onClick={() => setQueue(q.name)} className={`text-left rounded-2xl border p-4 transition-colors ${queue === q.name ? 'border-indigo-400 bg-indigo-50 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{q.label}</p>
              <div className="mt-2 grid grid-cols-5 gap-1 text-center text-xs">
                {(['waiting', 'active', 'delayed', 'failed', 'completed'] as JobState[]).map((st) => (
                  <div key={st}><p className={`text-lg font-bold ${st === 'failed' && q.counts[st] > 0 ? 'text-red-600' : 'text-slate-800 dark:text-slate-100'}`}>{q.counts[st]}</p><p className="text-slate-500">{{ waiting: 'Chờ', active: 'Chạy', delayed: 'Hoãn', failed: 'Lỗi', completed: 'Xong' }[st]}</p></div>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select value={state} onChange={(e) => setState(e.target.value as JobState)} className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm">
            <option value="failed">Thất bại</option><option value="delayed">Đang hoãn</option><option value="waiting">Đang chờ</option><option value="active">Đang chạy</option><option value="completed">Đã xong</option>
          </select>
          <button onClick={refresh} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"><RefreshCw size={15} /> Làm mới</button>
          {state === 'failed' && (
            <button onClick={() => window.confirm('Thử lại tất cả job thất bại trong hàng đợi này?') && retryAll.mutate()} disabled={retryAll.isPending} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50">Thử lại tất cả</button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
          {jobs.isLoading ? <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-left"><tr><th className="px-4 py-3">Job</th><th className="px-4 py-3">Thông tin</th><th className="px-4 py-3">Lần thử</th><th className="px-4 py-3">Lý do lỗi / lịch</th><th className="px-4 py-3" /></tr></thead>
              <tbody>
                {jobs.data?.map((j) => (
                  <tr key={j.id} className="border-t border-slate-100 dark:border-slate-800 align-top">
                    <td className="px-4 py-3 font-mono text-xs">{j.name}<div className="text-slate-400">{j.id.length > 24 ? `${j.id.slice(0, 24)}…` : j.id}</div></td>
                    <td className="px-4 py-3">{[j.info.kind, j.info.to, j.info.subject].filter(Boolean).join(' · ') || (j.info.orderId ? `Đơn ${j.info.orderId.slice(0, 8)}…` : '—')}</td>
                    <td className="px-4 py-3">{j.attemptsMade}/{j.maxAttempts}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs">{j.failedReason ?? (j.delayUntil ? `Chạy lúc ${new Date(j.delayUntil).toLocaleString('vi-VN')}` : '—')}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {state === 'failed' && <button onClick={() => retry.mutate(j.id)} className="text-indigo-700 font-semibold hover:underline mr-3">Thử lại</button>}
                      {state !== 'active' && <button onClick={() => window.confirm('Xoá job này?') && remove.mutate(j.id)} className="text-slate-400 hover:text-red-600" aria-label="Xoá"><Trash2 size={15} /></button>}
                    </td>
                  </tr>
                ))}
                {jobs.data?.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Không có job nào ở trạng thái này.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminSystemPage;

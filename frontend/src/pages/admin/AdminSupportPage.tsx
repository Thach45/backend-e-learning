import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Headset, Loader2 } from 'lucide-react';
import { useAdminTickets } from '../../hooks/useSupport';
import { TICKET_CATEGORY, TICKET_PRIORITY, TICKET_STATUS, type TicketCategory, type TicketStatus } from '../../api/support';

const sel = 'px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm';

const AdminSupportPage = () => {
  const [status, setStatus] = useState<TicketStatus | ''>('');
  const [category, setCategory] = useState<TicketCategory | ''>('');
  const [assigned, setAssigned] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminTickets({ page, status: status || undefined, category: category || undefined, assigned: assigned || undefined, search: search.trim() || undefined });
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3"><Headset size={28} className="text-indigo-600" /> Hỗ trợ khách hàng</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Yêu cầu hỗ trợ từ người dùng. Câu trả lời của bạn được gửi qua email và thông báo trong ứng dụng.</p>
      </div>

      {data?.counts && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(TICKET_STATUS) as TicketStatus[]).map((s) => (
            <button key={s} onClick={() => reset(setStatus)(status === s ? '' : s)} className={`text-left rounded-2xl border p-4 transition-colors ${status === s ? 'border-indigo-400 bg-indigo-50 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{data.counts![s]}</p>
              <p className="text-xs text-slate-500">{TICKET_STATUS[s].label}</p>
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(e) => reset(setSearch)(e.target.value)} placeholder="Tìm theo tiêu đề, tên, email..." className={`${sel} flex-1 min-w-[220px]`} />
        <select value={category} onChange={(e) => reset(setCategory)(e.target.value as TicketCategory | '')} className={sel}>
          <option value="">Mọi nhóm</option>
          {(Object.keys(TICKET_CATEGORY) as TicketCategory[]).map((c) => <option key={c} value={c}>{TICKET_CATEGORY[c]}</option>)}
        </select>
        <select value={assigned} onChange={(e) => reset(setAssigned)(e.target.value)} className={sel}>
          <option value="">Mọi người phụ trách</option>
          <option value="me">Của tôi</option>
          <option value="none">Chưa ai nhận</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
        {isLoading ? <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-left"><tr><th className="px-4 py-3">Tiêu đề</th><th className="px-4 py-3">Người gửi</th><th className="px-4 py-3">Nhóm</th><th className="px-4 py-3">Ưu tiên</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Cập nhật</th></tr></thead>
            <tbody>
              {data?.data.map((t) => (
                <tr key={t.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium"><Link to={`/admin/support/${t.id}`} className="text-indigo-700 dark:text-indigo-400 hover:underline">{t.subject}</Link><span className="ml-2 text-xs text-slate-400">({t._count.messages})</span></td>
                  <td className="px-4 py-3">{t.user.name}<div className="text-xs text-slate-400">{t.user.email}</div></td>
                  <td className="px-4 py-3">{TICKET_CATEGORY[t.category]}</td>
                  <td className="px-4 py-3">{t.priority === 'HIGH' ? <span className="text-red-600 font-semibold">{TICKET_PRIORITY[t.priority]}</span> : TICKET_PRIORITY[t.priority]}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TICKET_STATUS[t.status].cls}`}>{TICKET_STATUS[t.status].label}</span></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(t.lastMessageAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                </tr>
              ))}
              {data?.data.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Không có yêu cầu nào.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg border disabled:opacity-40">Trước</button>
          <span>Trang {page}/{data.totalPages}</span>
          <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg border disabled:opacity-40">Sau</button>
        </div>
      )}
    </div>
  );
};

export default AdminSupportPage;

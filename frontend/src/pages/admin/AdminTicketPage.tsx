import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import TicketThread from '../../components/support/TicketThread';
import { useReplyTicket, useTicket, useUpdateTicket } from '../../hooks/useSupport';
import { useAuthStatus } from '../../hooks/useAuthStatus';
import { TICKET_PRIORITY, TICKET_STATUS, type TicketPriority, type TicketStatus } from '../../api/support';

const sel = 'px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm';

const AdminTicketPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { user } = useAuthStatus();
  const { data: t, isLoading, isError } = useTicket(id);
  const reply = useReplyTicket();
  const update = useUpdateTicket();

  if (isLoading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  if (isError || !t) return <div className="py-20 text-center text-slate-500">Không tìm thấy yêu cầu.</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to="/admin/support" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> Danh sách yêu cầu</Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.subject}</h1>
        <p className="text-sm text-slate-500">Người gửi: <strong>{t.user.name}</strong> ({t.user.email})</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <label className="text-xs text-slate-500">Trạng thái
          <select value={t.status} onChange={(e) => update.mutate({ id: t.id, body: { status: e.target.value as TicketStatus } })} className={`${sel} ml-2`}>
            {(Object.keys(TICKET_STATUS) as TicketStatus[]).map((s) => <option key={s} value={s}>{TICKET_STATUS[s].label}</option>)}
          </select>
        </label>
        <label className="text-xs text-slate-500">Ưu tiên
          <select value={t.priority} onChange={(e) => update.mutate({ id: t.id, body: { priority: e.target.value as TicketPriority } })} className={`${sel} ml-2`}>
            {(Object.keys(TICKET_PRIORITY) as TicketPriority[]).map((p) => <option key={p} value={p}>{TICKET_PRIORITY[p]}</option>)}
          </select>
        </label>
        <button onClick={() => update.mutate({ id: t.id, body: { assignedToId: t.assignedToId === user?.id ? null : user?.id } })} className="text-sm font-semibold text-indigo-700 hover:underline">
          {t.assignedToId === user?.id ? 'Bỏ nhận' : t.assignedToId ? 'Nhận thay' : 'Nhận xử lý'}
        </button>
      </div>

      <TicketThread ticket={t} viewer="admin" canReply={t.status !== 'CLOSED'} sending={reply.isPending} onSend={(body) => reply.mutate({ id: t.id, body })} />
    </div>
  );
};

export default AdminTicketPage;

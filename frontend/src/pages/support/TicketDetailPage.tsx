import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import TicketThread from '../../components/support/TicketThread';
import { useCloseTicket, usePostTicketMessage, useTicket } from '../../hooks/useSupport';
import { useSEO } from '../../hooks/useSEO';

const TicketDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: t, isLoading, isError } = useTicket(id);
  const post = usePostTicketMessage();
  const close = useCloseTicket();
  useSEO({ title: t?.subject ?? 'Yêu cầu hỗ trợ' });

  if (isLoading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  if (isError || !t) return <div className="py-20 text-center text-slate-500">Không tìm thấy yêu cầu hỗ trợ.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link to="/support/tickets" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> Yêu cầu của tôi</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{t.subject}</h1>
        {t.status !== 'CLOSED' && (
          <button onClick={() => window.confirm('Đóng yêu cầu này? Bạn sẽ không nhắn thêm được nữa.') && close.mutate(t.id)} className="text-sm font-semibold text-slate-500 hover:text-red-600">Đóng yêu cầu</button>
        )}
      </div>
      <TicketThread ticket={t} viewer="user" canReply={t.status !== 'CLOSED'} sending={post.isPending} onSend={(body) => post.mutate({ id: t.id, body })} />
    </div>
  );
};

export default TicketDetailPage;

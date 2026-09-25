import { Link } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { useMyTickets } from '../../hooks/useSupport';
import { TICKET_CATEGORY, TICKET_STATUS } from '../../api/support';
import { useSEO } from '../../hooks/useSEO';

const MyTicketsPage = () => {
  useSEO({ title: 'Yêu cầu hỗ trợ của tôi' });
  const { data, isLoading } = useMyTickets();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Yêu cầu hỗ trợ của tôi</h1>
        <Link to="/support/tickets/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"><Plus size={16} /> Tạo yêu cầu</Link>
      </div>
      {isLoading ? <Loader2 className="animate-spin text-indigo-600" /> : (
        <div className="space-y-3">
          {data?.data.map((t) => (
            <Link key={t.id} to={`/support/tickets/${t.id}`} className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-indigo-300 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-900 dark:text-slate-50">{t.subject}</p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TICKET_STATUS[t.status].cls}`}>{TICKET_STATUS[t.status].label}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{TICKET_CATEGORY[t.category]} · {t._count.messages} tin nhắn · cập nhật {new Date(t.lastMessageAt).toLocaleString('vi-VN')}</p>
            </Link>
          ))}
          {data?.data.length === 0 && <p className="text-center text-slate-400 py-16">Bạn chưa có yêu cầu hỗ trợ nào. Xem <Link to="/help" className="text-indigo-600 hover:underline">Trung tâm trợ giúp</Link> hoặc tạo yêu cầu mới.</p>}
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;

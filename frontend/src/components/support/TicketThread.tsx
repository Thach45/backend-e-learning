import { useState } from 'react';
import { Send } from 'lucide-react';
import SimpleMarkdown from '../common/SimpleMarkdown';
import { TICKET_CATEGORY, TICKET_STATUS, type TicketDetail } from '../../api/support';

interface Props {
  ticket: TicketDetail;
  onSend: (body: string) => void;
  sending: boolean;
  canReply: boolean;
  /** Ai đang xem: nhãn "Bạn" và "Hỗ trợ" đổi chỗ tuỳ vai trò. */
  viewer: 'user' | 'admin';
}

/** Luồng trao đổi của một yêu cầu hỗ trợ. Nội dung là markdown tối giản, render an toàn (không chèn được HTML). */
const TicketThread = ({ ticket, onSend, sending, canReply, viewer }: Props) => {
  const [text, setText] = useState('');
  const st = TICKET_STATUS[ticket.status];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
        <span className="text-xs text-slate-500">{TICKET_CATEGORY[ticket.category]} · Tạo {new Date(ticket.createdAt).toLocaleString('vi-VN')}</span>
      </div>

      <ol className="space-y-4">
        {ticket.messages.map((m) => {
          const mine = viewer === 'admin' ? m.isStaff : !m.isStaff;
          return (
            <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${mine ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'}`}>
                <p className={`text-xs mb-1 ${mine ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {m.isStaff ? 'Hỗ trợ' : m.author.name} · {new Date(m.createdAt).toLocaleString('vi-VN')}
                </p>
                <div className={mine ? '[&_a]:text-white [&_a]:underline' : ''}><SimpleMarkdown source={m.body} /></div>
              </div>
            </li>
          );
        })}
      </ol>

      {canReply ? (
        <div className="space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} maxLength={10000} placeholder="Nhập nội dung trả lời..." className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          <button
            onClick={() => { onSend(text.trim()); setText(''); }}
            disabled={sending || !text.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send size={16} /> Gửi
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Yêu cầu đã đóng. Hãy tạo yêu cầu mới nếu bạn cần hỗ trợ thêm.</p>
      )}
    </div>
  );
};

export default TicketThread;

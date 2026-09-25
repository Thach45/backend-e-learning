import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateTicket } from '../../hooks/useSupport';
import { TICKET_CATEGORY, type TicketCategory } from '../../api/support';
import { useSEO } from '../../hooks/useSEO';

const inputCls = 'w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200';

const NewTicketPage = () => {
  useSEO({ title: 'Tạo yêu cầu hỗ trợ' });
  const navigate = useNavigate();
  const create = useCreateTicket();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('OTHER');
  const [body, setBody] = useState('');
  const valid = subject.trim().length >= 3 && body.trim().length >= 5;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link to="/support/tickets" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> Yêu cầu của tôi</Link>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Gửi yêu cầu hỗ trợ</h1>
      <p className="text-sm text-slate-500">Hãy mô tả càng cụ thể càng tốt (mã đơn hàng, tên khóa học, ảnh chụp lỗi dưới dạng liên kết...). Chúng tôi sẽ phản hồi qua email và thông báo trong ứng dụng.</p>
      <select value={category} onChange={(e) => setCategory(e.target.value as TicketCategory)} className={inputCls}>
        {(Object.keys(TICKET_CATEGORY) as TicketCategory[]).map((c) => <option key={c} value={c}>{TICKET_CATEGORY[c]}</option>)}
      </select>
      <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} placeholder="Tiêu đề ngắn gọn" className={inputCls} />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} maxLength={10000} placeholder="Nội dung chi tiết" className={inputCls} />
      <button
        onClick={() => create.mutate({ subject: subject.trim(), category, body: body.trim() }, { onSuccess: (t) => navigate(`/support/tickets/${t.id}`) })}
        disabled={!valid || create.isPending}
        className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
      >
        {create.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
      </button>
    </div>
  );
};

export default NewTicketPage;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LifeBuoy, Loader2, Search } from 'lucide-react';
import SimpleMarkdown from '../components/common/SimpleMarkdown';
import { useFaqs } from '../hooks/useSupport';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { useSEO } from '../hooks/useSEO';

/** Trung tâm trợ giúp công khai: tìm và xem câu hỏi thường gặp; không tìm thấy thì gửi yêu cầu hỗ trợ. */
const HelpCenterPage = () => {
  useSEO({ title: 'Trung tâm trợ giúp' });
  const { isAuthenticated } = useAuthStatus();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const { data, isLoading } = useFaqs(debounced);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-3">
        <LifeBuoy className="mx-auto text-indigo-600" size={40} />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Trung tâm trợ giúp</h1>
        <p className="text-slate-500">Tìm câu trả lời nhanh cho các thắc mắc thường gặp.</p>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); window.clearTimeout((window as unknown as { __faqT?: number }).__faqT); (window as unknown as { __faqT?: number }).__faqT = window.setTimeout(() => setDebounced(e.target.value.trim()), 300); }}
          placeholder="Nhập từ khóa, ví dụ: thanh toán, mật khẩu..."
          className="w-full pl-11 pr-4 py-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {isLoading ? <Loader2 className="animate-spin text-indigo-600 mx-auto" /> : (
        <div className="space-y-8">
          {data?.map((cat) => (
            <section key={cat.id}>
              <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-50 mb-3">{cat.name}</h2>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                {cat.faqs.map((f) => (
                  <div key={f.id}>
                    <button onClick={() => setOpen(open === f.id ? null : f.id)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <span className="font-medium text-slate-800 dark:text-slate-100">{f.question}</span>
                      <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${open === f.id ? 'rotate-180' : ''}`} />
                    </button>
                    {open === f.id && <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-300"><SimpleMarkdown source={f.answer} /></div>}
                  </div>
                ))}
              </div>
            </section>
          ))}
          {data?.length === 0 && <p className="text-center text-slate-400 py-8">{debounced ? 'Không tìm thấy câu hỏi phù hợp.' : 'Chưa có câu hỏi nào.'}</p>}
        </div>
      )}

      <div className="text-center bg-indigo-50 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-2xl p-6 space-y-3">
        <p className="font-semibold text-slate-800 dark:text-slate-100">Vẫn chưa tìm thấy câu trả lời?</p>
        {isAuthenticated ? (
          <div className="flex justify-center gap-3">
            <Link to="/support/tickets/new" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">Gửi yêu cầu hỗ trợ</Link>
            <Link to="/support/tickets" className="px-5 py-2.5 rounded-xl border border-indigo-200 text-indigo-700 text-sm font-semibold">Yêu cầu của tôi</Link>
          </div>
        ) : (
          <p className="text-sm text-slate-500"><Link to="/auth/login" className="text-indigo-600 font-semibold hover:underline">Đăng nhập</Link> để gửi yêu cầu hỗ trợ cho chúng tôi.</p>
        )}
      </div>
    </div>
  );
};

export default HelpCenterPage;

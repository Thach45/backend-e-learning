import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, Loader2 } from 'lucide-react';
import { pathsApi } from '../api/paths';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { useSEO } from '../hooks/useSEO';
import { PLACEHOLDER_IMAGE } from '../utils/placeholder';
import NotFoundPage from './NotFoundPage';

const vnd = (n: number) => (n === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n));

const PathDetailPage = () => {
  const { slug = '' } = useParams();
  const { isAuthenticated } = useAuthStatus();
  const { data, isLoading, isError } = useQuery({ queryKey: ['paths', slug], queryFn: () => pathsApi.detail(slug), retry: false });
  const { data: progress } = useQuery({ queryKey: ['paths', slug, 'progress'], queryFn: () => pathsApi.progress(slug), enabled: isAuthenticated && !!data, retry: false });
  useSEO({ title: data?.title ?? 'Lộ trình học', description: data?.description ?? undefined });

  if (isLoading) return <div className="py-32 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  if (isError || !data) return <NotFoundPage />;
  const stepOf = (id: string) => progress?.steps.find((s) => s.courseId === id);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <header className="space-y-3">
        <Link to="/paths" className="text-sm text-indigo-600 hover:underline">← Tất cả lộ trình</Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{data.title}</h1>
        {data.description && <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{data.description}</p>}
        {progress && (
          <div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${progress.percent}%` }} /></div>
            <p className="text-xs text-slate-500 mt-1">Đã hoàn thành {progress.completed}/{progress.total} khoá ({progress.percent}%)</p>
          </div>
        )}
      </header>

      <ol className="space-y-4">
        {data.courses.map((c, i) => {
          const s = stepOf(c.id);
          const current = progress?.currentCourseId === c.id;
          return (
            <li key={c.id} className={`flex gap-4 bg-white dark:bg-slate-900 border rounded-2xl p-4 ${current ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 dark:border-slate-800'}`}>
              <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${s?.completed ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-700'}`}>{s?.completed ? <Check size={18} /> : i + 1}</div>
              <img src={c.thumbnail || PLACEHOLDER_IMAGE} alt="" loading="lazy" className="w-28 h-20 rounded-xl object-cover hidden sm:block" />
              <div className="flex-1 min-w-0">
                <Link to={`/courses/${c.id}`} className="font-bold text-slate-900 dark:text-slate-50 hover:text-indigo-600">{c.title}</Link>
                <p className="text-xs text-slate-500">{c.instructor.name} · {vnd(c.salePrice ?? c.price)}</p>
                {c.note && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{c.note}</p>}
                {current && <p className="text-xs font-semibold text-indigo-600 mt-1">{s?.enrolled ? 'Bước hiện tại của bạn' : 'Bước tiếp theo của bạn'}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default PathDetailPage;

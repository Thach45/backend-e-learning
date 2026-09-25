import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Route } from 'lucide-react';
import { pathsApi } from '../api/paths';
import { useSEO } from '../hooks/useSEO';

const PathsListPage = () => {
  useSEO({ title: 'Lộ trình học', description: 'Chuỗi khoá học có thứ tự giúp bạn đi từ nền tảng đến thực chiến.' });
  const { data, isLoading } = useQuery({ queryKey: ['paths'], queryFn: pathsApi.list });
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Lộ trình học</h1>
        <p className="text-slate-500 mt-1">Chuỗi khoá học có thứ tự giúp bạn đi từ nền tảng đến thực chiến.</p>
      </div>
      {isLoading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
        : data?.length === 0 ? <p className="text-center text-slate-400 py-20">Chưa có lộ trình nào.</p>
        : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.map((p) => (
              <Link key={p.id} to={`/paths/${p.slug}`} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                {p.coverUrl ? <img src={p.coverUrl} alt="" loading="lazy" className="h-40 w-full object-cover" /> : <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-indigo-400"><Route size={40} /></div>}
                <div className="p-5">
                  <h2 className="font-bold text-slate-900 dark:text-slate-50 group-hover:text-indigo-600">{p.title}</h2>
                  {p.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{p.description}</p>}
                  <p className="mt-3 text-xs font-semibold text-indigo-600">{p.courseCount} khoá học</p>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
};

export default PathsListPage;

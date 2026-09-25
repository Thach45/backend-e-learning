import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, Loader2 } from 'lucide-react';
import { publicProfileApi } from '../api/publicProfile';
import CourseMiniCard from '../components/course/CourseMiniCard';
import { useSEO } from '../hooks/useSEO';
import NotFoundPage from './NotFoundPage';

const PublicProfilePage = () => {
  const { userId = '' } = useParams();
  const { data, isLoading, isError } = useQuery({ queryKey: ['public-profile', userId], queryFn: () => publicProfileApi.view(userId), retry: false });
  useSEO({ title: data ? `${data.name} · Hồ sơ học tập` : 'Hồ sơ học tập', description: data?.headline ?? undefined });

  if (isLoading) return <div className="py-32 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  if (isError || !data) return <NotFoundPage />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <header className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {data.avatar ? <img src={data.avatar} alt="" className="w-24 h-24 rounded-full object-cover" /> : <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 text-4xl font-bold flex items-center justify-center">{data.name.charAt(0).toUpperCase()}</div>}
        <div className="text-center sm:text-left space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{data.name}</h1>
          {data.headline && <p className="text-slate-600 dark:text-slate-300">{data.headline}</p>}
          <p className="text-sm text-slate-400">Tham gia từ {new Date(data.memberSince).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })} · {data.stats.enrolledCourses} khoá học{data.stats.completedCourses !== null && ` · ${data.stats.completedCourses} đã hoàn thành`}</p>
          {data.bio && <p className="pt-2 text-slate-700 dark:text-slate-200 whitespace-pre-line max-w-2xl">{data.bio}</p>}
        </div>
      </header>

      {data.badges && data.badges.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Huy hiệu</h2>
          <div className="flex flex-wrap gap-3">
            {data.badges.map((b) => (
              <div key={b.code} title={b.description} className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold"><Award size={16} /> {b.name}</div>
            ))}
          </div>
        </section>
      )}

      {data.completedCourses && data.completedCourses.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Khoá học đã hoàn thành</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.completedCourses.map((c) => <CourseMiniCard key={c.id} course={c}><p className="text-xs text-emerald-600 mt-1">Hoàn thành {new Date(c.completedAt).toLocaleDateString('vi-VN')}</p></CourseMiniCard>)}
          </div>
        </section>
      )}
    </div>
  );
};

export default PublicProfilePage;

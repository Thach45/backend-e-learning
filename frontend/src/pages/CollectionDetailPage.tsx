import { useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Globe, Link2, Loader2, Lock } from 'lucide-react';
import { collectionsApi } from '../api/collections';
import CourseMiniCard from '../components/course/CourseMiniCard';
import { useSEO } from '../hooks/useSEO';
import NotFoundPage from './NotFoundPage';

const CollectionDetailPage = () => {
  const { id = '' } = useParams();
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ['collections', 'detail', id], queryFn: () => collectionsApi.detail(id), retry: false });
  useSEO({ title: data?.title ?? 'Bộ sưu tập', description: data?.description ?? undefined });
  const refresh = () => qc.invalidateQueries({ queryKey: ['collections'] });
  const togglePublic = useMutation({ mutationFn: () => collectionsApi.update(id, { isPublic: !data?.isPublic }), onSuccess: refresh });
  const removeCourse = useMutation({ mutationFn: (courseId: string) => collectionsApi.removeCourse(id, courseId), onSuccess: refresh });

  if (isLoading) return <div className="py-32 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  if (isError || !data) return <NotFoundPage />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{data.title}</h1>
        {data.description && <p className="text-slate-600 dark:text-slate-300">{data.description}</p>}
        <p className="text-sm text-slate-500">Bộ sưu tập của {data.ownerName} · {data.courses.length} khoá học</p>
        {data.isOwner && (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button onClick={() => togglePublic.mutate()} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm">{data.isPublic ? <><Globe size={14} /> Công khai (bấm để chuyển riêng tư)</> : <><Lock size={14} /> Riêng tư (bấm để công khai)</>}</button>
            {data.isPublic && <button onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Đã chép liên kết.'); }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm"><Link2 size={14} /> Chép liên kết</button>}
          </div>
        )}
      </div>
      {data.courses.length === 0 ? <p className="text-slate-400 py-12 text-center">Chưa có khoá học nào.</p> : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.courses.map((c) => (
            <CourseMiniCard key={c.id} course={c}>
              {data.isOwner && <button onClick={() => removeCourse.mutate(c.id)} className="mt-2 self-start text-xs text-slate-400 hover:text-red-600">Gỡ khỏi bộ sưu tập</button>}
            </CourseMiniCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionDetailPage;

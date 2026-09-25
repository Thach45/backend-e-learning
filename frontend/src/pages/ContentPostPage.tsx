import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { postsApi, type PostKind } from '../api/posts';
import SimpleMarkdown from '../components/common/SimpleMarkdown';
import { useSEO } from '../hooks/useSEO';
import NotFoundPage from './NotFoundPage';

/** Dùng chung cho bài blog (/blog/:slug) và trang tĩnh (/p/:slug). */
const ContentPostPage = ({ kind }: { kind: PostKind }) => {
  const { slug = '' } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['post', kind, slug],
    queryFn: () => (kind === 'BLOG' ? postsApi.blogPost(slug) : postsApi.page(slug)),
    retry: false,
  });
  useSEO({ title: data?.title ?? 'Bài viết', description: data?.excerpt ?? undefined, image: data?.coverUrl ?? undefined });

  if (isLoading) return <div className="py-32 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  if (isError || !data) return <NotFoundPage />;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 text-slate-700 dark:text-slate-300">
      {kind === 'BLOG' && <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline mb-6"><ArrowLeft size={14} /> Tất cả bài viết</Link>}
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-3">{data.title}</h1>
      {kind === 'BLOG' && (
        <p className="text-sm text-slate-400 mb-6">{data.authorName} · {data.publishedAt ? new Date(data.publishedAt).toLocaleDateString('vi-VN') : ''} · {data.views} lượt xem</p>
      )}
      {data.coverUrl && <img src={data.coverUrl} alt="" className="w-full rounded-2xl mb-8 max-h-96 object-cover" />}
      <SimpleMarkdown source={data.body} />
    </article>
  );
};

export default ContentPostPage;

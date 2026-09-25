import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Eye, Loader2, Search } from 'lucide-react';
import { postsApi } from '../api/posts';
import { useSEO } from '../hooks/useSEO';

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('vi-VN') : '');

const BlogListPage = () => {
  useSEO({ title: 'Blog', description: 'Bài viết, hướng dẫn và tin tức từ U Đê Mê.' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQuery({ queryKey: ['blog', search, page], queryFn: () => postsApi.blog({ search: search || undefined, page, limit: 9 }), placeholderData: (prev) => prev });
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Blog</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Bài viết, hướng dẫn và tin tức từ U Đê Mê.</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm bài viết..." className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm w-64" />
        </div>
      </div>

      {isLoading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
        : isError ? <p className="text-center text-slate-500 py-20">Không tải được danh sách bài viết.</p>
        : data && data.items.length === 0 ? <p className="text-center text-slate-500 py-20">{search ? 'Không có bài viết nào khớp.' : 'Chưa có bài viết nào.'}</p>
        : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.items.map((p) => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                {p.coverUrl ? <img src={p.coverUrl} alt="" loading="lazy" className="h-44 w-full object-cover" /> : <div className="h-44 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-700" />}
                <div className="p-5 flex-1 flex flex-col gap-2">
                  <h2 className="font-bold text-lg text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 line-clamp-2">{p.title}</h2>
                  {p.excerpt && <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{p.excerpt}</p>}
                  <div className="mt-auto pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{p.authorName} · {fmt(p.publishedAt)}</span>
                    <span className="inline-flex items-center gap-1"><Eye size={13} /> {p.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      {pages > 1 && (
        <div className="flex justify-center items-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">Trước</button>
          <span className="text-sm text-slate-500">Trang {page}/{pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">Sau</button>
        </div>
      )}
    </div>
  );
};

export default BlogListPage;

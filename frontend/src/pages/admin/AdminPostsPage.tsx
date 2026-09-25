import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExternalLink, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { postsApi, type PostKind, type PostStatus } from '../../api/posts';

const AdminPostsPage = () => {
  const qc = useQueryClient();
  const [kind, setKind] = useState<PostKind | ''>('');
  const [status, setStatus] = useState<PostStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const params = { kind: kind || undefined, status: status || undefined, search: search || undefined, page };
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'posts', params], queryFn: () => postsApi.adminList(params), placeholderData: (p) => p });
  const remove = useMutation({
    mutationFn: (id: string) => postsApi.remove(id),
    onSuccess: () => { toast.success('Đã xoá.'); qc.invalidateQueries({ queryKey: ['admin', 'posts'] }); qc.invalidateQueries({ queryKey: ['blog'] }); },
    onError: () => toast.error('Không xoá được.'),
  });
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  const sel = 'px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Blog và trang tĩnh</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Bài viết ở /blog, trang tĩnh ở /p/tên-trang (có thể gắn vào chân trang).</p>
        </div>
        <Link to="/admin/posts/new" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 flex items-center gap-2"><Plus size={18} /> Viết mới</Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm theo tiêu đề..." className={`${sel} w-64`} />
        <select value={kind} onChange={(e) => { setKind(e.target.value as PostKind | ''); setPage(1); }} className={sel}><option value="">Mọi loại</option><option value="BLOG">Bài blog</option><option value="PAGE">Trang tĩnh</option></select>
        <select value={status} onChange={(e) => { setStatus(e.target.value as PostStatus | ''); setPage(1); }} className={sel}><option value="">Mọi trạng thái</option><option value="PUBLISHED">Đã đăng</option><option value="DRAFT">Bản nháp</option></select>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
        {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-left text-slate-500"><tr><th className="px-4 py-3">Tiêu đề</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Lượt xem</th><th className="px-4 py-3">Cập nhật</th><th className="px-4 py-3" /></tr></thead>
            <tbody>
              {data?.items.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3"><Link to={`/admin/posts/${p.id}`} className="font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 flex items-center gap-2"><FileText size={15} className="text-slate-400" />{p.title}</Link><div className="text-xs text-slate-400 ml-6">/{p.kind === 'BLOG' ? 'blog' : 'p'}/{p.slug}{p.showInFooter && ' · ở chân trang'}</div></td>
                  <td className="px-4 py-3">{p.kind === 'BLOG' ? 'Blog' : 'Trang tĩnh'}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{p.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp'}</span></td>
                  <td className="px-4 py-3">{p.kind === 'BLOG' ? p.views : '—'}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(p.updatedAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {p.status === 'PUBLISHED' && <a href={`/${p.kind === 'BLOG' ? 'blog' : 'p'}/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 mr-3 inline-block" aria-label="Xem"><ExternalLink size={15} /></a>}
                    <button onClick={() => window.confirm(`Xoá "${p.title}"?`) && remove.mutate(p.id)} className="text-slate-400 hover:text-red-600" aria-label="Xoá"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {data?.items.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Chưa có nội dung nào.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
      {pages > 1 && <div className="flex justify-center items-center gap-3"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">Trước</button><span className="text-sm text-slate-500">Trang {page}/{pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">Sau</button></div>}
    </div>
  );
};

export default AdminPostsPage;

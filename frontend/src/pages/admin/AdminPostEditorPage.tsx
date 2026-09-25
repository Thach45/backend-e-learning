import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { postsApi, type PostForm } from '../../api/posts';
import SimpleMarkdown from '../../components/common/SimpleMarkdown';
import ImageUpload from '../../components/common/ImageUpload';

const empty: PostForm = { kind: 'BLOG', title: '', slug: '', excerpt: '', coverUrl: '', body: '', status: 'DRAFT', showInFooter: false };
const inputCls = 'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none';

const AdminPostEditorPage = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<PostForm>(empty);
  const existing = useQuery({ queryKey: ['admin', 'post', id], queryFn: () => postsApi.adminGet(id as string), enabled: !isNew });

  useEffect(() => {
    if (existing.data) {
      const p = existing.data;
      setForm({ kind: p.kind, title: p.title, slug: p.slug, excerpt: p.excerpt ?? '', coverUrl: p.coverUrl ?? '', body: p.body, status: p.status, showInFooter: p.showInFooter });
    }
  }, [existing.data]);

  const save = useMutation({
    mutationFn: async (status: PostForm['status']) => {
      const payload = { ...form, status, slug: form.slug || undefined, excerpt: form.excerpt || null, coverUrl: form.coverUrl || null };
      if (isNew) return postsApi.create(payload);
      const { kind: _kind, ...rest } = payload;
      return postsApi.update(id as string, rest);
    },
    onSuccess: (p) => {
      toast.success(p.status === 'PUBLISHED' ? 'Đã đăng.' : 'Đã lưu bản nháp.');
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
      qc.invalidateQueries({ queryKey: ['admin', 'post', p.id] });
      qc.invalidateQueries({ queryKey: ['blog'] });
      qc.invalidateQueries({ queryKey: ['post'] });
      qc.invalidateQueries({ queryKey: ['footer-pages'] });
      if (isNew) navigate(`/admin/posts/${p.id}`, { replace: true });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Không lưu được.'),
  });

  const set = <K extends keyof PostForm>(k: K, v: PostForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const canSave = form.title.trim().length > 0 && !save.isPending;
  if (!isNew && existing.isLoading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate('/admin/posts')} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Danh sách</button>
        <div className="flex gap-2">
          <button disabled={!canSave} onClick={() => save.mutate('DRAFT')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold disabled:opacity-50"><Save size={15} /> Lưu nháp</button>
          <button disabled={!canSave} onClick={() => save.mutate('PUBLISHED')} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50">{save.isPending ? <Loader2 size={15} className="animate-spin" /> : null} {form.status === 'PUBLISHED' && !isNew ? 'Cập nhật' : 'Đăng'}</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1"><span className="text-xs text-slate-500">Loại</span>
              <select disabled={!isNew} value={form.kind} onChange={(e) => set('kind', e.target.value as PostForm['kind'])} className={inputCls}><option value="BLOG">Bài blog</option><option value="PAGE">Trang tĩnh</option></select></label>
            <label className="space-y-1"><span className="text-xs text-slate-500">Đường dẫn (để trống = tự sinh từ tiêu đề)</span>
              <input value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value.toLowerCase())} placeholder="vd: gioi-thieu" className={inputCls} /></label>
          </div>
          <label className="block space-y-1"><span className="text-xs text-slate-500">Tiêu đề</span><input value={form.title} maxLength={200} onChange={(e) => set('title', e.target.value)} className={inputCls} /></label>
          <label className="block space-y-1"><span className="text-xs text-slate-500">Tóm tắt (hiện ở danh sách và khi chia sẻ)</span><textarea value={form.excerpt ?? ''} maxLength={300} rows={2} onChange={(e) => set('excerpt', e.target.value)} className={inputCls} /></label>
          <ImageUpload value={form.coverUrl ?? ''} onChange={(url) => set('coverUrl', url)} label="Ảnh bìa" folder="posts" />
          {form.kind === 'PAGE' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.showInFooter} onChange={(e) => set('showInFooter', e.target.checked)} /> Hiện liên kết ở chân trang</label>}
          <label className="block space-y-1"><span className="text-xs text-slate-500">Nội dung (markdown: # tiêu đề, **đậm**, *nghiêng*, - danh sách, &gt; trích dẫn, [chữ](https://...))</span>
            <textarea value={form.body} rows={18} onChange={(e) => set('body', e.target.value)} className={`${inputCls} font-mono`} /></label>
        </div>
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Xem trước</p>
          <h2 className="text-2xl font-bold mb-3">{form.title || 'Tiêu đề'}</h2>
          {form.coverUrl && <img src={form.coverUrl} alt="" className="w-full rounded-xl mb-4 max-h-60 object-cover" />}
          <SimpleMarkdown source={form.body || '_Nội dung sẽ hiện ở đây_'} />
        </div>
      </div>
    </div>
  );
};

export default AdminPostEditorPage;

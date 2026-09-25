import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { pathsApi, type PathForm } from '../../api/paths';
import { useCourses } from '../../hooks/useCourses';
import ImageUpload from '../../components/common/ImageUpload';

const input = 'w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm';
const errMsg = (e: any) => e?.response?.data?.message ?? 'Thao tác thất bại.';
const empty: PathForm = { title: '', slug: '', description: '', coverUrl: '', isPublished: false, courses: [] };

const AdminPathsPage = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'paths'], queryFn: pathsApi.adminList });
  const { data: coursesData } = useCourses({ page: 1, limit: 100, status: 'PUBLISHED' });
  const allCourses = coursesData?.data ?? [];
  const titleOf = (id: string) => allCourses.find((c) => c.id === id)?.title ?? id.slice(0, 8);
  const [editing, setEditing] = useState<{ id?: string; form: PathForm } | null>(null);
  const [pick, setPick] = useState('');
  const refresh = () => { qc.invalidateQueries({ queryKey: ['admin', 'paths'] }); qc.invalidateQueries({ queryKey: ['paths'] }); };

  const open = async (id: string) => {
    const p = await pathsApi.adminGet(id);
    setEditing({ id, form: { title: p.title, slug: p.slug, description: p.description, coverUrl: p.coverUrl, isPublished: p.isPublished, courses: p.courses.map((c) => ({ courseId: c.courseId, note: c.note })) } });
  };
  const save = useMutation({
    mutationFn: () => {
      const f = editing!.form;
      const body = { ...f, slug: f.slug || undefined, description: f.description || null, coverUrl: f.coverUrl || null, courses: f.courses.map((c) => ({ courseId: c.courseId, note: c.note || null })) };
      return editing!.id ? pathsApi.update(editing!.id, body) : pathsApi.create(body);
    },
    onSuccess: () => { toast.success('Đã lưu lộ trình.'); setEditing(null); refresh(); },
    onError: (e) => toast.error(errMsg(e)),
  });
  const del = useMutation({ mutationFn: pathsApi.remove, onSuccess: refresh, onError: (e) => toast.error(errMsg(e)) });
  const f = editing?.form;
  const set = (p: Partial<PathForm>) => setEditing((e) => (e ? { ...e, form: { ...e.form, ...p } } : e));
  const move = (i: number, d: number) => { if (!f) return; const a = [...f.courses]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; set({ courses: a }); };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Lộ trình học</h1><p className="text-slate-500 mt-1">Chuỗi khoá học có thứ tự, hiện ở /paths.</p></div>
        <button onClick={() => setEditing({ form: empty })} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl flex items-center gap-2"><Plus size={18} /> Tạo lộ trình</button>
      </div>

      {editing && f && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-200 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between"><h2 className="font-bold">{editing.id ? 'Sửa lộ trình' : 'Lộ trình mới'}</h2><button onClick={() => setEditing(null)} aria-label="Đóng"><X size={18} /></button></div>
          <div className="grid grid-cols-2 gap-3">
            <input className={input} placeholder="Tên lộ trình" maxLength={150} value={f.title} onChange={(e) => set({ title: e.target.value })} />
            <input className={input} placeholder="Đường dẫn (để trống = tự sinh)" value={f.slug ?? ''} onChange={(e) => set({ slug: e.target.value.toLowerCase() })} />
          </div>
          <textarea className={input} rows={3} maxLength={1000} placeholder="Mô tả" value={f.description ?? ''} onChange={(e) => set({ description: e.target.value })} />
          <ImageUpload value={f.coverUrl ?? ''} onChange={(url) => set({ coverUrl: url })} label="Ảnh bìa" folder="paths" />
          <div className="space-y-2">
            <p className="text-sm font-semibold">Các khoá học theo thứ tự ({f.courses.length}/20)</p>
            {f.courses.map((c, i) => (
              <div key={c.courseId} className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl p-2">
                <span className="w-6 text-center text-sm font-bold text-indigo-600">{i + 1}</span>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{titleOf(c.courseId)}</p>
                  <input className={`${input} mt-1`} placeholder="Ghi chú cho bước này (tuỳ chọn)" maxLength={200} value={c.note ?? ''} onChange={(e) => set({ courses: f.courses.map((x, k) => (k === i ? { ...x, note: e.target.value } : x)) })} /></div>
                <button onClick={() => move(i, -1)} aria-label="Lên" className="text-slate-400 hover:text-indigo-600"><ArrowUp size={16} /></button>
                <button onClick={() => move(i, 1)} aria-label="Xuống" className="text-slate-400 hover:text-indigo-600"><ArrowDown size={16} /></button>
                <button onClick={() => set({ courses: f.courses.filter((_, k) => k !== i) })} aria-label="Gỡ" className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <select className={input} value={pick} onChange={(e) => setPick(e.target.value)}>
                <option value="">+ Thêm khoá học...</option>
                {allCourses.filter((c) => !f.courses.some((x) => x.courseId === c.id)).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <button disabled={!pick || f.courses.length >= 20} onClick={() => { set({ courses: [...f.courses, { courseId: pick, note: '' }] }); setPick(''); }} className="px-4 rounded-xl border text-sm font-semibold disabled:opacity-50">Thêm</button>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isPublished} onChange={(e) => set({ isPublished: e.target.checked })} /> Công khai</label>
          <button onClick={() => save.mutate()} disabled={save.isPending || !f.title.trim()} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50">Lưu</button>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div> : (
          <ul>
            {data?.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-0 border-slate-100 dark:border-slate-800">
                <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{p.title}</p><p className="text-xs text-slate-400">/paths/{p.slug} · {p.courseCount} khoá</p></div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{p.isPublished ? 'Công khai' : 'Nháp'}</span>
                <button onClick={() => open(p.id)} aria-label="Sửa" className="text-slate-400 hover:text-indigo-600"><Pencil size={15} /></button>
                <button onClick={() => window.confirm(`Xoá lộ trình "${p.title}"?`) && del.mutate(p.id)} aria-label="Xoá" className="text-slate-400 hover:text-red-600"><Trash2 size={15} /></button>
              </li>
            ))}
            {data?.length === 0 && <li className="px-4 py-12 text-center text-slate-400">Chưa có lộ trình nào.</li>}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminPathsPage;

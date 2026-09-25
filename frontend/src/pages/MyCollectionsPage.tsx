import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Globe, Loader2, Lock, Plus, Trash2 } from 'lucide-react';
import { collectionsApi } from '../api/collections';
import { useSEO } from '../hooks/useSEO';

const MyCollectionsPage = () => {
  useSEO({ title: 'Bộ sưu tập của tôi' });
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['collections', 'mine'], queryFn: () => collectionsApi.mine() });
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ['collections'] });
  const create = useMutation({ mutationFn: () => collectionsApi.create({ title: title.trim(), isPublic }), onSuccess: () => { setTitle(''); refresh(); }, onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Không tạo được.') });
  const remove = useMutation({ mutationFn: collectionsApi.remove, onSuccess: refresh });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Bộ sưu tập của tôi</h1>
        <p className="text-slate-500 mt-1">Gom các khoá học bạn quan tâm thành danh sách riêng, có thể chia sẻ bằng liên kết.</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) create.mutate(); }} className="flex flex-wrap gap-3 items-center">
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Tên bộ sưu tập mới" className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Công khai</label>
        <button disabled={!title.trim() || create.isPending} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50"><Plus size={16} /> Tạo</button>
      </form>
      {isLoading ? <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div> : (
        <ul className="space-y-3">
          {data?.map((c) => (
            <li key={c.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <Link to={`/collections/${c.id}`} className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-50 truncate">{c.title}</p>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">{c.isPublic ? <><Globe size={12} /> Công khai</> : <><Lock size={12} /> Riêng tư</>} · {c.courseCount} khoá học</p>
              </Link>
              <button onClick={() => window.confirm(`Xoá bộ sưu tập "${c.title}"?`) && remove.mutate(c.id)} aria-label="Xoá" className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
            </li>
          ))}
          {data?.length === 0 && <li className="text-center text-slate-400 py-12">Chưa có bộ sưu tập nào. Bấm biểu tượng dấu trang ở trang khoá học để lưu.</li>}
        </ul>
      )}
    </div>
  );
};

export default MyCollectionsPage;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bookmark, Check, Loader2, Plus } from 'lucide-react';
import { collectionsApi } from '../../api/collections';
import { useAuthStatus } from '../../hooks/useAuthStatus';

/** Nút "Lưu vào bộ sưu tập" kèm danh sách bật/tắt và ô tạo nhanh bộ sưu tập mới. */
const AddToCollection = ({ courseId }: { courseId: string }) => {
  const { isAuthenticated } = useAuthStatus();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const key = ['collections', 'mine', courseId];
  const { data, isLoading } = useQuery({ queryKey: key, queryFn: () => collectionsApi.mine(courseId), enabled: open && isAuthenticated });
  const refresh = () => { qc.invalidateQueries({ queryKey: ['collections'] }); };
  const toggle = useMutation({
    mutationFn: (c: { id: string; contains: boolean }) => (c.contains ? collectionsApi.removeCourse(c.id, courseId) : collectionsApi.addCourse(c.id, courseId)),
    onSuccess: refresh,
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Không thực hiện được.'),
  });
  const create = useMutation({
    mutationFn: async () => { const c = await collectionsApi.create({ title: title.trim() }); await collectionsApi.addCourse(c.id, courseId); },
    onSuccess: () => { setTitle(''); toast.success('Đã tạo và thêm khoá học.'); refresh(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Không tạo được.'),
  });

  return (
    <div className="relative">
      <button
        onClick={() => (isAuthenticated ? setOpen((o) => !o) : navigate('/login'))}
        aria-label="Lưu vào bộ sưu tập"
        title="Lưu vào bộ sưu tập"
        className="px-4 py-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-xl active:scale-95 transition-all"
      >
        <Bookmark size={20} />
      </button>
      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-72 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 space-y-2">
          <p className="text-sm font-bold px-1">Lưu vào bộ sưu tập</p>
          {isLoading ? <div className="py-4 flex justify-center"><Loader2 className="animate-spin" size={18} /></div> : (
            <ul className="max-h-48 overflow-y-auto">
              {data?.map((c) => (
                <li key={c.id}>
                  <button onClick={() => toggle.mutate({ id: c.id, contains: !!c.contains })} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm text-left">
                    <span className={`w-5 h-5 rounded border flex items-center justify-center ${c.contains ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>{c.contains && <Check size={13} />}</span>
                    <span className="flex-1 truncate">{c.title}</span>
                    <span className="text-xs text-slate-400">{c.courseCount}</span>
                  </button>
                </li>
              ))}
              {data?.length === 0 && <li className="text-xs text-slate-400 px-2 py-2">Bạn chưa có bộ sưu tập nào.</li>}
            </ul>
          )}
          <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) create.mutate(); }} className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="Bộ sưu tập mới..." className="flex-1 min-w-0 px-3 py-1.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 rounded-lg text-sm" />
            <button disabled={!title.trim() || create.isPending} className="p-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50" aria-label="Tạo"><Plus size={16} /></button>
          </form>
          <Link to="/collections" className="block text-center text-xs text-indigo-600 hover:underline">Quản lý bộ sưu tập</Link>
        </div>
      )}
    </div>
  );
};

export default AddToCollection;

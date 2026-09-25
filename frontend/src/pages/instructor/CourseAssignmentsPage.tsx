import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Loader2, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useInstructorAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from '../../hooks/useAssignments';
import type { InstructorAssignment } from '../../api/assignments';

const inputCls = 'w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 outline-none';

const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

type Draft = { title: string; description: string; dueAt: string; maxScore: string; allowLate: boolean; isPublished: boolean };
const emptyDraft: Draft = { title: '', description: '', dueAt: '', maxScore: '100', allowLate: true, isPublished: true };

const CourseAssignmentsPage = () => {
  const { id: courseId = '' } = useParams<{ id: string }>();
  const { data: assignments, isLoading } = useInstructorAssignments(courseId);
  const create = useCreateAssignment();
  const update = useUpdateAssignment();
  const remove = useDeleteAssignment();

  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const open = (a?: InstructorAssignment) => {
    setEditing(a ? a.id : 'new');
    setDraft(a ? { title: a.title, description: a.description, dueAt: toLocalInput(a.dueAt), maxScore: String(a.maxScore), allowLate: a.allowLate, isPublished: a.isPublished } : emptyDraft);
  };

  const save = () => {
    const body = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      dueAt: draft.dueAt ? new Date(draft.dueAt).toISOString() : null,
      maxScore: Math.max(1, Math.round(Number(draft.maxScore) || 100)),
      allowLate: draft.allowLate,
      isPublished: draft.isPublished,
    };
    if (!body.title || !body.description) return;
    const done = { onSuccess: () => setEditing(null) };
    if (editing === 'new') create.mutate({ courseId, body }, done);
    else update.mutate({ id: editing as string, body }, done);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link to={`/instructor/courses/${courseId}/edit`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600">
        <ArrowLeft size={16} /> Quay lại khóa học
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><ClipboardList className="text-purple-600" /> Bài tập của khóa học</h1>
        <button onClick={() => open()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"><Plus size={16} /> Giao bài tập</button>
      </div>

      {editing && (
        <section className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-white dark:bg-slate-900">
          <h2 className="font-semibold">{editing === 'new' ? 'Bài tập mới' : 'Sửa bài tập'}</h2>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={200} placeholder="Tiêu đề" className={inputCls} />
          <div>
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={6} placeholder="Đề bài (hỗ trợ **đậm**, danh sách - ..., liên kết [chữ](https://...))" className={`${inputCls} font-mono`} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Hạn nộp (tuỳ chọn)</label><input type="datetime-local" value={draft.dueAt} onChange={(e) => setDraft({ ...draft, dueAt: e.target.value })} className={inputCls} /></div>
            <div><label className="block text-xs font-semibold text-slate-500 mb-1">Điểm tối đa</label><input type="number" min={1} max={1000} value={draft.maxScore} onChange={(e) => setDraft({ ...draft, maxScore: e.target.value })} className={inputCls} /></div>
            <div className="flex flex-col justify-end gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.allowLate} onChange={(e) => setDraft({ ...draft, allowLate: e.target.checked })} className="accent-purple-600" /> Cho nộp trễ</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={draft.isPublished} onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })} className="accent-purple-600" /> Công bố cho học viên</label>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} disabled={create.isPending || update.isPending || !draft.title.trim() || !draft.description.trim()} className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50">Lưu</button>
            <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold">Huỷ</button>
          </div>
        </section>
      )}

      {isLoading ? (
        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-purple-600" /></div>
      ) : (
        <div className="space-y-3">
          {assignments?.map((a) => (
            <div key={a.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[220px]">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{a.title} {!a.isPublished && <span className="ml-2 text-[10px] font-bold text-slate-500 border rounded px-1">NHÁP</span>}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {a.dueAt ? `Hạn: ${new Date(a.dueAt).toLocaleString('vi-VN')}` : 'Không có hạn'} · Tối đa {a.maxScore} điểm · {a.allowLate ? 'Cho nộp trễ' : 'Không nộp trễ'}
                </p>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold">{a.submissionCount}</span> bài nộp · <span className="text-amber-700 font-semibold">{a.pendingCount}</span> chờ chấm · <span className="text-emerald-700 font-semibold">{a.gradedCount}</span> đã chấm
              </div>
              <div className="flex items-center gap-1">
                <Link to={`/instructor/assignments/${a.id}/submissions`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-purple-700 hover:bg-purple-50"><Users size={15} /> Chấm bài</Link>
                <button onClick={() => open(a)} className="p-2 text-slate-400 hover:text-purple-600 rounded-lg" aria-label="Sửa"><Pencil size={16} /></button>
                <button onClick={() => window.confirm(`Xoá bài tập "${a.title}"? Học viên sẽ không thấy nữa (bài nộp vẫn được giữ).`) && remove.mutate(a.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg" aria-label="Xoá"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {assignments?.length === 0 && !editing && <p className="text-center text-slate-400 py-12">Chưa có bài tập nào. Bấm "Giao bài tập" để tạo bài đầu tiên.</p>}
        </div>
      )}
    </div>
  );
};

export default CourseAssignmentsPage;

import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import SimpleMarkdown from '../components/common/SimpleMarkdown';
import { useAssignment, useSubmitAssignment } from '../hooks/useAssignments';
import { assignmentsApi, SUBMISSION_LABELS } from '../api/assignments';
import { useSEO } from '../hooks/useSEO';

const AssignmentDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: a, isLoading, error } = useAssignment(id);
  const submit = useSubmitAssignment();
  useSEO({ title: a?.title ?? 'Bài tập' });

  const [text, setText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (a?.mySubmission) {
      setText(a.mySubmission.textContent ?? '');
      setFileUrl(a.mySubmission.fileUrl ?? '');
      setFileName(a.mySubmission.fileName ?? '');
    }
  }, [a?.mySubmission?.id, a?.mySubmission?.submittedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
  if (error || !a) return <div className="py-20 text-center text-slate-500">Không thể tải bài tập (bạn cần ghi danh khóa học này).</div>;

  const s = a.mySubmission;
  const locked = s?.status === 'GRADED';
  const overdue = !!a.dueAt && new Date(a.dueAt).getTime() < Date.now();
  const closed = overdue && !a.allowLate;

  const onFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const r = await assignmentsApi.uploadFile(file);
      setFileUrl(r.url);
      setFileName(r.originalFilename);
    } catch {
      toast.error('Không tải được tệp. Chỉ nhận PDF, Word, PowerPoint, Excel, ZIP, RAR tối đa 50MB.');
    } finally {
      setUploading(false);
    }
  };

  const canSend = (text.trim() || fileUrl.trim()) && !submit.isPending && !uploading;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link to="/my-assignments" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> Bài tập của tôi</Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{a.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{a.dueAt ? `Hạn nộp: ${new Date(a.dueAt).toLocaleString('vi-VN')}` : 'Không có hạn nộp'} · Tối đa {a.maxScore} điểm</p>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-slate-700 dark:text-slate-300"><SimpleMarkdown source={a.description} /></div>

      {s && (
        <div className={`rounded-2xl p-5 border ${s.status === 'GRADED' ? 'bg-emerald-50 border-emerald-200' : s.status === 'RETURNED' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <p className="font-semibold text-slate-800">{SUBMISSION_LABELS[s.status].label}{s.status === 'GRADED' && <> · <span className="text-emerald-700">{s.score}/{a.maxScore} điểm</span></>}{s.isLate && <span className="ml-2 text-xs text-red-600">(nộp trễ)</span>}</p>
          {s.feedback && <div className="mt-2 text-sm text-slate-700"><strong>Nhận xét của giảng viên:</strong><div className="whitespace-pre-wrap mt-1">{s.feedback}</div></div>}
        </div>
      )}

      {locked ? (
        <p className="text-sm text-slate-500">Bài đã được chấm điểm nên không thể nộp lại.</p>
      ) : closed ? (
        <p className="text-sm text-red-600">Đã quá hạn nộp bài.</p>
      ) : (
        <section className="space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">{s ? 'Nộp lại bài' : 'Nộp bài'}</h2>
          {overdue && <p className="text-sm text-amber-700">Đã quá hạn, bài nộp sẽ được đánh dấu là nộp trễ.</p>}
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} maxLength={20000} placeholder="Nội dung bài làm của bạn..." className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <input ref={fileRef} type="file" hidden onChange={(e) => onFile(e.target.files?.[0])} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold disabled:opacity-50">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />} Tải tệp lên
              </button>
              <span className="text-xs text-slate-500">PDF, Word, PowerPoint, Excel, ZIP, RAR (tối đa 50MB)</span>
            </div>
            <input value={fileUrl} onChange={(e) => { setFileUrl(e.target.value); if (!e.target.value) setFileName(''); }} placeholder="Hoặc dán liên kết https:// (Google Drive, GitHub...)" className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
            {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"><ExternalLink size={14} /> {fileName || 'Mở liên kết đã đính kèm'}</a>}
          </div>
          <button
            onClick={() => submit.mutate({ id: a.id, body: { textContent: text.trim() || null, fileUrl: fileUrl.trim() || null, fileName: fileName || null } })}
            disabled={!canSend}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {submit.isPending ? 'Đang nộp...' : s ? 'Nộp lại' : 'Nộp bài'}
          </button>
        </section>
      )}
    </div>
  );
};

export default AssignmentDetailPage;

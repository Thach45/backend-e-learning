import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import SimpleMarkdown from '../../components/common/SimpleMarkdown';
import { useAssignmentSubmissions, useGradeSubmission } from '../../hooks/useAssignments';
import { SUBMISSION_LABELS, type Submission, type SubmissionStatus } from '../../api/assignments';

const inputCls = 'w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-200';

const SubmissionCard = ({ s, maxScore }: { s: Submission & { user: { name: string } }; maxScore: number }) => {
  const grade = useGradeSubmission();
  const [score, setScore] = useState(s.score?.toString() ?? '');
  const [feedback, setFeedback] = useState(s.feedback ?? '');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{s.user.name}</p>
          <p className="text-xs text-slate-500">Nộp lúc {new Date(s.submittedAt).toLocaleString('vi-VN')} {s.isLate && <span className="text-red-600 font-semibold">· Nộp trễ</span>}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SUBMISSION_LABELS[s.status].cls}`}>{SUBMISSION_LABELS[s.status].label}{s.status === 'GRADED' && ` · ${s.score}/${maxScore}`}</span>
      </div>
      {s.textContent && <div className="text-sm bg-slate-50 dark:bg-slate-950 rounded-xl p-3 whitespace-pre-wrap">{s.textContent}</div>}
      {s.fileUrl && (
        <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-purple-700 hover:underline">
          <ExternalLink size={14} /> {s.fileName || 'Tệp đính kèm'}
        </a>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Điểm (/{maxScore})</label>
          <input type="number" min={0} max={maxScore} value={score} onChange={(e) => setScore(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nhận xét</label>
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} maxLength={5000} className={inputCls} />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => grade.mutate({ id: s.id, body: { score: Number(score), feedback: feedback.trim() || null } })}
          disabled={grade.isPending || score === '' || Number(score) < 0 || Number(score) > maxScore}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
        >
          Chấm điểm
        </button>
        <button
          onClick={() => grade.mutate({ id: s.id, body: { returnForRevision: true, feedback: feedback.trim() || null } })}
          disabled={grade.isPending || feedback.trim().length < 5}
          title={feedback.trim().length < 5 ? 'Hãy ghi nhận xét để học viên biết cần sửa gì' : ''}
          className="px-4 py-2 rounded-xl border border-red-200 text-red-700 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
        >
          Trả lại để sửa
        </button>
      </div>
    </div>
  );
};

const AssignmentSubmissionsPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [status, setStatus] = useState<SubmissionStatus | ''>('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAssignmentSubmissions(id, { status: status || undefined, page });

  return (
    <div className="space-y-6 max-w-4xl">
      {data && <Link to={`/instructor/courses/${data.assignment.courseId}/assignments`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-purple-600"><ArrowLeft size={16} /> Quay lại danh sách bài tập</Link>}
      {data && (
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data.assignment.title}</h1>
          <details className="mt-2 text-sm text-slate-600 dark:text-slate-300"><summary className="cursor-pointer text-purple-700">Xem đề bài</summary><div className="mt-2"><SimpleMarkdown source={data.assignment.description} /></div></details>
        </div>
      )}
      <select value={status} onChange={(e) => { setStatus(e.target.value as SubmissionStatus | ''); setPage(1); }} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm bg-white dark:bg-slate-900">
        <option value="">Tất cả bài nộp</option>
        {(Object.keys(SUBMISSION_LABELS) as SubmissionStatus[]).map((s) => <option key={s} value={s}>{SUBMISSION_LABELS[s].label}</option>)}
      </select>
      {isLoading ? <Loader2 className="animate-spin text-purple-600" /> : (
        <div className="space-y-4">
          {data?.data.map((s) => <SubmissionCard key={`${s.id}-${s.status}-${s.gradedAt}`} s={s} maxScore={data.assignment.maxScore} />)}
          {data?.data.length === 0 && <p className="text-center text-slate-400 py-12">Chưa có bài nộp nào.</p>}
        </div>
      )}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg border disabled:opacity-40">Trước</button>
          <span>Trang {page}/{data.totalPages}</span>
          <button disabled={page >= data.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg border disabled:opacity-40">Sau</button>
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmissionsPage;

import { Link } from 'react-router-dom';
import { ClipboardList, Loader2 } from 'lucide-react';
import { useMyAssignments } from '../hooks/useAssignments';
import { SUBMISSION_LABELS } from '../api/assignments';
import { useSEO } from '../hooks/useSEO';

const MyAssignmentsPage = () => {
  useSEO({ title: 'Bài tập của tôi' });
  const { data, isLoading } = useMyAssignments();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3"><ClipboardList className="text-indigo-600" /> Bài tập của tôi</h1>
      {isLoading ? <Loader2 className="animate-spin text-indigo-600" /> : (
        <div className="space-y-3">
          {data?.map((a) => {
            const overdue = !!a.dueAt && new Date(a.dueAt).getTime() < Date.now() && !a.mySubmission;
            return (
              <Link key={a.id} to={`/assignments/${a.id}`} className="block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-indigo-300 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">{a.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{a.course?.title} · {a.dueAt ? `Hạn ${new Date(a.dueAt).toLocaleString('vi-VN')}` : 'Không có hạn'}</p>
                  </div>
                  {a.mySubmission ? (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SUBMISSION_LABELS[a.mySubmission.status].cls}`}>
                      {SUBMISSION_LABELS[a.mySubmission.status].label}{a.mySubmission.status === 'GRADED' && ` · ${a.mySubmission.score}/${a.maxScore}`}
                    </span>
                  ) : (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${overdue ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{overdue ? 'Quá hạn, chưa nộp' : 'Chưa nộp'}</span>
                  )}
                </div>
              </Link>
            );
          })}
          {data?.length === 0 && <p className="text-center text-slate-400 py-16">Các khóa học bạn đã ghi danh chưa có bài tập nào.</p>}
        </div>
      )}
    </div>
  );
};

export default MyAssignmentsPage;

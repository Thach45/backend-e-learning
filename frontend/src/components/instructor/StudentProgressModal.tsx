import { Loader2, X } from 'lucide-react';
import { useStudentProgress } from '../../hooks/useInstructorStudents';
import { SUBMISSION_LABELS } from '../../api/assignments';

interface Props {
  courseId: string;
  userId: string;
  onClose: () => void;
}

/** Tiến độ từng bài của một học viên và kết quả bài tập. */
const StudentProgressModal = ({ courseId, userId, onClose }: Props) => {
  const { data, isLoading, isError } = useStudentProgress(courseId, userId);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">{data?.student.name ?? 'Tiến độ học viên'}</h2>
            {data && <p className="text-sm text-slate-500">{data.student.email}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Đóng"><X size={20} /></button>
        </div>
        <div className="p-5 overflow-y-auto space-y-6">
          {isLoading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-600" /></div>}
          {isError && <p className="text-center text-slate-500 py-10">Không tải được tiến độ của học viên này.</p>}
          {data && (
            <>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold">Tiến độ tổng</span>
                  <span>{data.overallProgress}% · {data.completedLessons}/{data.totalLessons} bài hoàn thành</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-purple-600" style={{ width: `${data.overallProgress}%` }} /></div>
                <p className="text-xs text-slate-500 mt-2">Ghi danh {new Date(data.enrolledAt).toLocaleDateString('vi-VN')}{data.completedAt && ` · Hoàn thành ${new Date(data.completedAt).toLocaleDateString('vi-VN')}`}</p>
              </div>

              {data.chapters.map((c) => (
                <div key={c.id}>
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-2">{c.title}</h3>
                  <ul className="space-y-1.5">
                    {c.lessons.map((l) => (
                      <li key={l.id} className="flex items-center gap-3 text-sm">
                        <span className="flex-1 truncate text-slate-600 dark:text-slate-300">{l.title}</span>
                        <div className="w-28 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${l.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${l.progressPercent}%` }} /></div>
                        <span className="w-10 text-right text-xs text-slate-500">{l.progressPercent}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {data.assignments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2">Bài tập</h3>
                  <ul className="space-y-1.5 text-sm">
                    {data.assignments.map((a, i) => (
                      <li key={i} className="flex items-center justify-between gap-3">
                        <span className="truncate">{a.title}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SUBMISSION_LABELS[a.status].cls}`}>
                          {SUBMISSION_LABELS[a.status].label}{a.status === 'GRADED' && ` · ${a.score}/${a.maxScore}`}{a.isLate && ' · trễ'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProgressModal;

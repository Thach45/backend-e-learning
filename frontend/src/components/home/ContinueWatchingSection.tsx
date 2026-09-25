import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { useAuthStatus } from '../../hooks/useAuthStatus';
import { useContinueWatching } from '../../hooks/useEnrollments';

const ContinueWatchingSection = () => {
  const { isAuthenticated } = useAuthStatus();
  const { data, isLoading } = useContinueWatching();

  if (!isAuthenticated || isLoading) return null;
  const items = data?.data ?? [];
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Tiếp tục học</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Link
            key={item.courseId}
            to={`/learn/course/${item.courseId}/lesson/${item.lessonId}`}
            className="group flex gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 hover:shadow-md transition-all p-3"
          >
            <div className="relative w-28 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={item.courseThumbnail || 'https://via.placeholder.com/400x300?text=No+Image'}
                alt={item.courseTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle size={24} className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50 line-clamp-1">{item.courseTitle}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{item.lessonTitle}</p>
              <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, item.progressPercent))}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ContinueWatchingSection;

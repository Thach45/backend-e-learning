import { Trophy, Medal } from 'lucide-react';
import { useLeaderboard } from '../hooks/useGamification';

const RANK_STYLES: Record<number, string> = {
  1: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  2: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600',
  3: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
};

const LeaderboardPage = () => {
  const { data, isLoading } = useLeaderboard();
  const entries = data?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500">
            <Trophy size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Bảng xếp hạng học viên</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Xếp hạng theo tổng số bài học đã hoàn thành
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : entries.length > 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {entries.map((entry) => (
              <div key={entry.userId} className="flex items-center gap-4 px-5 py-4">
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full border font-bold text-sm flex-shrink-0 ${
                    RANK_STYLES[entry.rank] ?? 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {entry.rank <= 3 ? <Medal size={16} /> : entry.rank}
                </div>
                <img
                  src={entry.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}&background=random`}
                  alt={entry.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-50 truncate">{entry.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">{entry.completedLessons}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">bài học</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
            <p className="text-slate-500 dark:text-slate-400 text-sm">Chưa có dữ liệu xếp hạng.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LeaderboardPage;

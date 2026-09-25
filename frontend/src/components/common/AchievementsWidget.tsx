import { Link } from 'react-router-dom';
import { Flame, Award, Trophy } from 'lucide-react';
import { useMyBadges, useStreak } from '../../hooks/useGamification';

const AchievementsWidget = () => {
  const { data: streak } = useStreak();
  const { data: badgesData } = useMyBadges();

  const badges = badgesData?.data ?? [];
  const earnedBadges = badges.filter((b) => b.earned);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <Trophy size={16} className="text-amber-500" /> Thành tích
        </h3>
        <Link to="/leaderboard" className="text-xs font-bold text-indigo-600 hover:underline">
          Bảng xếp hạng
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
        <div className="w-10 h-10 flex items-center justify-center bg-orange-100 dark:bg-orange-900/40 rounded-full text-orange-600">
          <Flame size={20} />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{streak?.currentStreak ?? 0} ngày</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Chuỗi ngày học liên tiếp</p>
        </div>
      </div>

      {badges.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Huy hiệu ({earnedBadges.length}/{badges.length})
          </p>
          <div className="grid grid-cols-5 gap-2">
            {badges.map((badge) => (
              <div
                key={badge.code}
                title={`${badge.name}: ${badge.description}${badge.earned ? '' : ' (chưa mở khóa)'}`}
                className={`aspect-square flex items-center justify-center rounded-xl text-xl border ${
                  badge.earned
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-40 grayscale'
                }`}
              >
                {badge.icon ?? <Award size={18} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsWidget;

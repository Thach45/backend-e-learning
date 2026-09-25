import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useRecommendations } from '../../hooks/useLearningProfile';
import { useAuthStatus } from '../../hooks/useAuthStatus';
import { PLACEHOLDER_IMAGE } from '../../utils/placeholder';

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

/** "Dành cho bạn": gợi ý theo hồ sơ học tập. Chỉ hiện khi người dùng đã đồng ý cá nhân hoá và có khoá phù hợp. */
const RecommendedCoursesSection = () => {
  const { isAuthenticated, hasRole } = useAuthStatus();
  const { data } = useRecommendations(isAuthenticated && !hasRole('ADMIN'), 4);

  if (!data?.enabled || data.data.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-indigo-600" size={22} />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dành cho bạn</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.data.map((c) => (
          <Link
            key={c.id}
            to={`/courses/${c.id}`}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col"
          >
            <div className="aspect-video overflow-hidden rounded-t-xl bg-slate-100">
              <img src={c.thumbnail || PLACEHOLDER_IMAGE} alt={c.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex flex-col flex-1 gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 text-sm line-clamp-2">{c.title}</h3>
              <p className="text-xs text-slate-500">{c.instructor.name}</p>
              <ul className="flex flex-wrap gap-1.5">
                {c.reasons.map((r) => (
                  <li key={r} className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {r}
                  </li>
                ))}
              </ul>
              <span className="mt-auto font-semibold text-indigo-600 text-sm">{formatVND(c.salePrice || c.price)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendedCoursesSection;

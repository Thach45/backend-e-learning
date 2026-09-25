import { ArrowRight, BookOpen, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { HomeConfig } from '../../api/home';

const DEFAULT_TITLE = 'Khai phóng tiềm năng với kiến thức thực chiến';
const DEFAULT_SUBTITLE = 'Học từ các giảng viên có kinh nghiệm, theo lộ trình rõ ràng và thực hành ngay trên từng bài học.';
const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

/** Tiêu đề/mô tả do admin cấu hình; các con số là số liệu thật từ hệ thống (ẩn khi còn quá ít để không gây hiểu nhầm). */
const HeroSection = ({ hero, stats }: { hero?: HomeConfig['hero']; stats?: HomeConfig['stats'] }) => {
  const navigate = useNavigate();
  const items = [
    stats && stats.learners > 0 && { icon: Users, value: fmt(stats.learners), label: 'học viên đã ghi danh' },
    stats && stats.courses > 0 && { icon: BookOpen, value: fmt(stats.courses), label: 'khoá học' },
    stats && stats.avgRating !== null && stats.reviews >= 1 && { icon: Star, value: `${stats.avgRating}/5`, label: `từ ${fmt(stats.reviews)} đánh giá` },
  ].filter(Boolean) as { icon: typeof Users; value: string; label: string }[];

  return (
    <section className="relative py-8 md:py-6 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-sm font-semibold mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            Nền tảng học tập trực tuyến
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold text-slate-900 dark:text-slate-50 leading-[1.1] mb-6 tracking-tight">
            {hero?.title || DEFAULT_TITLE}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-xl">{hero?.subtitle || DEFAULT_SUBTITLE}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/courses')} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
              Bắt đầu học ngay <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/blog')} className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Đọc blog
            </button>
          </div>
          {items.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
              {items.map((it) => (
                <div key={it.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center"><it.icon size={20} /></div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-50 leading-tight">{it.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{it.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10"></div>
          <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white/50 aspect-square md:aspect-auto md:h-[500px]">
            <img src="/assets/hero-student.png" alt="Học viên đang học trực tuyến" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

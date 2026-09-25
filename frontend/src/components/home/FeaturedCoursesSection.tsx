import { Heart, MonitorPlay, Star, TrendingUp } from 'lucide-react';

export type Course = {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice: number;
  thumbnail: string;
  tag: string;
  lessons: number;
  duration: string;
};

type Props = {
  courses: Course[];
  formatPrice: (amount: number) => string;
};

const FeaturedCoursesSection = ({ courses, formatPrice }: Props) => {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Khóa học đề xuất cho bạn</h2>
        <div className="flex gap-2">
          <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-white dark:bg-slate-900 hover:shadow-sm">←</button>
          <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-white dark:bg-slate-900 hover:shadow-sm">→</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {courses.map(course => (
          <a href={`/courses/${course.id}`} key={course.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white dark:bg-slate-900/90 backdrop-blur-md text-xs font-bold px-2 py-1 rounded-md text-slate-700 dark:text-slate-200 shadow-sm border border-white/20">
                {course.tag}
              </div>
              <button className="absolute bottom-3 right-3 w-9 h-9 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-500 shadow-md transition-all lg:opacity-0 lg:group-hover:opacity-100 lg:transform lg:translate-y-2 lg:group-hover:translate-y-0 hover:scale-110">
                <Heart size={18} fill="currentColor" />
              </button>
            </div>

            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded"><MonitorPlay size={12}/> {course.lessons} bài</span>
                <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded"><TrendingUp size={12}/> {course.duration}</span>
              </div>

              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {course.title}
              </h3>

              <div className="flex items-center gap-2 mb-4">
                <img src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`} alt="" className="w-6 h-6 rounded-full border border-white shadow-sm" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{course.instructor}</span>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{course.rating}</span>
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">({course.reviews})</span>
                </div>
                <div className="text-right">
                  {course.price > 0 ? (
                    <div className="flex flex-col items-end">
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 line-through font-medium">{formatPrice(course.oldPrice)}</div>
                      <div className="font-bold text-indigo-600 text-lg">{formatPrice(course.price)}</div>
                    </div>
                  ) : (
                    <div className="font-bold text-emerald-600 uppercase text-sm bg-emerald-50 px-2 py-1 rounded">Miễn phí</div>
                  )}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;


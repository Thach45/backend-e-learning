import { ArrowRight } from 'lucide-react';

export type Category = {
  id: string;
  name: string;
  count: number;
  imageUrl?: string | null;
};

type Props = {
  categories: Category[];
};

const CategoriesSection = ({ categories }: Props) => {
  return (
    <section className="py-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Danh mục nổi bật</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Khám phá các chủ đề phổ biến nhất hiện nay</p>
        </div>
        <a href="#" className="hidden sm:flex text-sm font-semibold text-indigo-600 hover:text-indigo-700 items-center gap-1 bg-indigo-50 px-4 py-2 rounded-full transition-colors">
          Xem tất cả <ArrowRight size={16} />
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map(cat => (
          <a key={cat.id} href="#" className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-100/30 hover:-translate-y-1 transition-all text-center">
            {cat.imageUrl ? (
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-14 h-14 mx-auto rounded-2xl object-cover mb-4 group-hover:scale-110 transition-transform shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4 group-hover:scale-110 transition-transform shadow-sm" />
            )}
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm group-hover:text-indigo-600 transition-colors">{cat.name}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{cat.count} khóa học</p>
          </a>
        ))}
      </div>
    </section>
  );
};

export default CategoriesSection;


import { Star } from 'lucide-react';
import type { HomeTestimonial } from '../../api/home';

const TestimonialsSection = ({ items }: { items: HomeTestimonial[] }) => {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-8 text-center">Học viên nói gì về chúng tôi</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <figure key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            {t.rating && <div className="flex gap-0.5 text-amber-400" aria-label={`${t.rating} sao`}>{Array.from({ length: t.rating }).map((_, k) => <Star key={k} size={16} fill="currentColor" />)}</div>}
            <blockquote className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">“{t.content}”</blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              {t.avatarUrl ? <img src={t.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center">{t.name.charAt(0).toUpperCase()}</div>}
              <div><p className="font-semibold text-slate-900 dark:text-slate-50 text-sm">{t.name}</p>{t.role && <p className="text-xs text-slate-500">{t.role}</p>}</div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;

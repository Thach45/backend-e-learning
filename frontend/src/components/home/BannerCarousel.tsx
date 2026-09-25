import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { HomeBanner } from '../../api/home';

const isInternal = (u: string) => u.startsWith('/');

const Slide = ({ b }: { b: HomeBanner }) => {
  const body = (
    <div className="relative h-48 sm:h-64 md:h-72 rounded-3xl overflow-hidden bg-slate-200">
      <img src={b.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
      <div className="relative h-full flex flex-col justify-center gap-2 px-6 sm:px-12 max-w-2xl text-white">
        <h2 className="text-2xl sm:text-4xl font-bold leading-tight">{b.title}</h2>
        {b.subtitle && <p className="text-sm sm:text-base text-white/90">{b.subtitle}</p>}
        {b.linkUrl && <span className="mt-2 inline-block self-start px-5 py-2 rounded-xl bg-white text-slate-900 text-sm font-bold">{b.ctaLabel || 'Xem chi tiết'}</span>}
      </div>
    </div>
  );
  if (!b.linkUrl) return body;
  return isInternal(b.linkUrl) ? <Link to={b.linkUrl}>{body}</Link> : <a href={b.linkUrl} target="_blank" rel="noopener noreferrer">{body}</a>;
};

const BannerCarousel = ({ banners }: { banners: HomeBanner[] }) => {
  const [i, setI] = useState(0);
  const n = banners.length;
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6000);
    return () => clearInterval(t);
  }, [n]);
  if (n === 0) return null;
  const cur = banners[Math.min(i, n - 1)];
  return (
    <section aria-label="Banner" className="relative">
      <Slide b={cur} />
      {n > 1 && (
        <>
          <button onClick={() => setI((i - 1 + n) % n)} aria-label="Trước" className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"><ChevronLeft size={18} /></button>
          <button onClick={() => setI((i + 1) % n)} aria-label="Sau" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white"><ChevronRight size={18} /></button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((b, k) => <button key={b.id} onClick={() => setI(k)} aria-label={`Banner ${k + 1}`} className={`h-2 rounded-full transition-all ${k === i ? 'w-6 bg-white' : 'w-2 bg-white/60'}`} />)}
          </div>
        </>
      )}
    </section>
  );
};

export default BannerCarousel;

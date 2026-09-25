import { Link } from 'react-router-dom';
import type { HomeConfig } from '../../api/home';

const LatestPostsSection = ({ posts }: { posts: HomeConfig['latestPosts'] }) => {
  if (posts.length === 0) return null;
  return (
    <section>
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">Bài viết mới</h2>
        <Link to="/blog" className="text-sm font-semibold text-indigo-600 hover:underline">Xem tất cả</Link>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            {p.coverUrl ? <img src={p.coverUrl} alt="" loading="lazy" className="h-40 w-full object-cover" /> : <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-700" />}
            <div className="p-5">
              <h3 className="font-bold text-slate-900 dark:text-slate-50 group-hover:text-indigo-600 line-clamp-2">{p.title}</h3>
              {p.excerpt && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{p.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default LatestPostsSection;

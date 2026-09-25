import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Users } from 'lucide-react';
import { useMyWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import { useAddToCart } from '../hooks/useCart';
import { formatVND } from '../utils/format';
import type { WishlistItem } from '../api/wishlist';

const LIMIT = 12;

const WishlistCard = ({ item, onRemove }: { item: WishlistItem; onRemove: () => void }) => {
  const course = item.course;
  const addToCartMutation = useAddToCart();
  if (!course) return null;

  const price = course.salePrice ?? course.price;
  const hasDiscount = course.salePrice != null && course.salePrice < course.price;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden flex flex-col">
      <Link to={`/courses/${course.id}`} className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800 block">
        <img
          src={course.thumbnail || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/courses/${course.id}`}>
          <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm line-clamp-2 mb-1 hover:text-indigo-600 transition-colors">
            {course.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{course.instructor?.name || 'Unknown'}</p>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
          {typeof course.totalStars === 'number' && (
            <span className="inline-flex items-center gap-1">
              <Star size={12} className="fill-amber-400 text-amber-400" />
              {course.totalStars}
            </span>
          )}
          {typeof course.totalLearners === 'number' && (
            <span className="inline-flex items-center gap-1">
              <Users size={12} />
              {course.totalLearners}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-indigo-600 font-bold text-sm">{formatVND(price)}</span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 dark:text-slate-500 line-through">{formatVND(course.price)}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRemove}
              title="Xóa khỏi yêu thích"
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Heart size={16} fill="currentColor" />
            </button>
            <button
              onClick={() => addToCartMutation.mutate(course.id)}
              title="Thêm vào giỏ hàng"
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WishlistPage = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyWishlist({ page, limit: LIMIT });
  const removeFromWishlistMutation = useRemoveFromWishlist();

  const items = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Danh sách yêu thích</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {data?.total ?? 0} khóa học bạn đã lưu để xem sau.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Đang tải danh sách yêu thích...</p>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((item) => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onRemove={() => {
                    if (item.course) {
                      removeFromWishlistMutation.mutate(item.course.id);
                    }
                  }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:bg-slate-950"
                >
                  Trước
                </button>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Trang {page}/{totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:bg-slate-950"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
              <Heart size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Chưa có khóa học yêu thích</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Lưu lại các khóa học bạn quan tâm để xem sau.</p>
            <Link
              to="/courses"
              className="inline-block px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Khám phá khóa học ngay
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default WishlistPage;

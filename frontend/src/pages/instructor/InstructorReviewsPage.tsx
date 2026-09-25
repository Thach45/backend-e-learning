import { useState, useEffect } from 'react';
import { Search, Star, Edit, Trash2, Loader2, AlertCircle, X, Save, Reply } from 'lucide-react';
import { useInstructorReviewsByCourse, useUpdateInstructorReview, useDeleteInstructorReview, useReplyToInstructorReview } from '../../hooks/useInstructorReviews';
import { useInstructorCourses } from '../../hooks/useInstructorCourses';
import type { InstructorReview } from '../../api/instructorReviews';

const InstructorReviewsPage = () => {
  const [page, setPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<string>('ALL');
  const [editingReview, setEditingReview] = useState<{ courseId: string; reviewId: string } | null>(null);
  const [replyingReview, setReplyingReview] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: coursesData } = useInstructorCourses({ limit: 100 });
  const courses = coursesData?.data || [];

  // Auto-select first course if available
  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0].id);
    }
  }, [courses, selectedCourse]);

  const { data: reviewsData, isLoading, error } = useInstructorReviewsByCourse(
    selectedCourse || '',
    {
      page,
      limit: 10,
      rating: selectedRating !== 'ALL' ? parseInt(selectedRating) : undefined,
    }
  );

  const updateMutation = useUpdateInstructorReview();
  const deleteMutation = useDeleteInstructorReview();
  const replyMutation = useReplyToInstructorReview();

  const reviews = reviewsData?.data || [];
  const totalPages = reviewsData?.totalPages || 1;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = (courseId: string, reviewId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      deleteMutation.mutate({ courseId, reviewId });
    }
  };

  const handleStartReply = (reviewId: string, currentReply?: string | null) => {
    setReplyingReview(reviewId);
    setReplyText(currentReply || '');
  };

  const handleSubmitReply = (courseId: string, reviewId: string) => {
    if (!replyText.trim()) return;
    replyMutation.mutate(
      { courseId, reviewId, reply: replyText.trim() },
      { onSuccess: () => setReplyingReview(null) },
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Đánh giá khóa học</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Xem đánh giá từ học viên về khóa học của bạn</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Chọn khóa học</label>
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-100 outline-none"
          >
            <option value="">-- Chọn khóa học --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        {selectedCourse && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Lọc theo đánh giá:</span>
            <div className="flex gap-2">
              {['ALL', '5', '4', '3', '2', '1'].map((rating) => (
                <button
                  key={rating}
                  onClick={() => {
                    setSelectedRating(rating);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1 ${
                    selectedRating === rating
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {rating !== 'ALL' && <Star size={14} className={selectedRating === rating ? 'fill-white' : 'fill-amber-400'} />}
                  {rating === 'ALL' ? 'Tất cả' : rating}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-center gap-3">
          <AlertCircle className="text-rose-600" size={24} />
          <div>
            <p className="font-semibold text-rose-800">Lỗi khi tải dữ liệu</p>
            <p className="text-sm text-rose-600">Vui lòng thử lại sau.</p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {!isLoading && !error && (
        <>
          {!selectedCourse ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">Vui lòng chọn khóa học để xem đánh giá</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">Khóa học này chưa có đánh giá nào</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        {review.user?.avatar ? (
                          <img
                            src={review.user.avatar}
                            alt={review.user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">
                              {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{review.user?.name || 'N/A'}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{review.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingReview({ courseId: review.courseId, reviewId: review.id })}
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(review.courseId, review.id)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-slate-600 dark:text-slate-300 mb-3 pl-16">{review.comment}</p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-slate-500 pl-16 mb-3">{formatDate(review.createdAt)}</p>

                    <div className="pl-16">
                      {review.instructorReply && replyingReview !== review.id && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-400 rounded-r-xl p-3 mb-2">
                          <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-1">Phản hồi của bạn</p>
                          <p className="text-sm text-slate-700 dark:text-slate-200">{review.instructorReply}</p>
                        </div>
                      )}

                      {replyingReview === review.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                            placeholder="Viết phản hồi cho học viên..."
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSubmitReply(review.courseId, review.id)}
                              disabled={replyMutation.isPending || !replyText.trim()}
                              className="px-4 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                              {replyMutation.isPending ? 'Đang gửi...' : 'Gửi phản hồi'}
                            </button>
                            <button
                              onClick={() => setReplyingReview(null)}
                              className="px-4 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartReply(review.id, review.instructorReply)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700"
                        >
                          <Reply size={14} /> {review.instructorReply ? 'Sửa phản hồi' : 'Phản hồi'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <ReviewModal
          courseId={editingReview.courseId}
          reviewId={editingReview.reviewId}
          onClose={() => setEditingReview(null)}
          onSubmit={(data) => {
            updateMutation.mutate(
              { courseId: editingReview.courseId, reviewId: editingReview.reviewId, body: data },
              {
                onSuccess: () => {
                  setEditingReview(null);
                },
              }
            );
          }}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
};

// Review Modal Component
type ReviewModalProps = {
  courseId: string;
  reviewId: string;
  onClose: () => void;
  onSubmit: (data: { rating: number; comment?: string | null }) => void;
  isLoading: boolean;
};

const ReviewModal = ({ courseId, reviewId, onClose, onSubmit, isLoading }: ReviewModalProps) => {
  const { data: reviewsData } = useInstructorReviewsByCourse(courseId, { limit: 1000 });
  const review = reviewsData?.data.find(r => r.id === reviewId);
  const [rating, setRating] = useState(review?.rating || 5);
  const [comment, setComment] = useState(review?.comment || '');

  useEffect(() => {
    if (review) {
      setRating(review.rating);
      setComment(review.comment || '');
    }
  }, [review, reviewsData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rating, comment: comment || null });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Chỉnh sửa đánh giá</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Đánh giá *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <Star
                    size={24}
                    className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{rating} sao</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Bình luận</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-100 outline-none"
              placeholder="Nhập bình luận..."
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Lưu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorReviewsPage;

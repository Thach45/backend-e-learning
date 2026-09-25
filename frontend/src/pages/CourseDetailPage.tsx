import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Star, 
  PlayCircle, 
  Check, 
  Users, 
  AlertCircle, 
  MonitorPlay, 
  FileText, 
  Code, 
  Clock, 
  Globe, 
  Award, 
  Share2, 
  ChevronDown, 
  ChevronRight,
  Heart,
  Edit3,
  X,
  Loader2,
  Lock,
  ThumbsUp
} from 'lucide-react';
import { useCourse, useRelatedCourses, usePreviewLesson } from '../hooks/useCourses';
import MediaPreviewModal, { guessStorageType } from '../components/course/MediaPreviewModal';
import { useSEO } from '../hooks/useSEO';
import { useAddToCart } from '../hooks/useCart';
import { useReviewsByCourse, useMyReview, useCreateReview, useSetReviewHelpful } from '../hooks/useReviews';
import { useAuthStatus } from '../hooks/useAuthStatus';
import ReportButton from '../components/common/ReportButton';
import type { CreateReviewBody, Review } from '../api/reviews';
import { useAddToWishlist, useCheckWishlist, useRemoveFromWishlist } from '../hooks/useWishlist';
import { PLACEHOLDER_IMAGE } from '../utils/placeholder';

// --- HELPER FUNCTIONS ---
const LANGUAGE_LABELS: Record<string, string> = {
  vi: 'Tiếng Việt', en: 'Tiếng Anh', ja: 'Tiếng Nhật', ko: 'Tiếng Hàn', zh: 'Tiếng Trung',
  fr: 'Tiếng Pháp', de: 'Tiếng Đức', es: 'Tiếng Tây Ban Nha',
};

const formatVND = (amount: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// --- SUB-COMPONENTS ---

const AccordionItem = ({ section, defaultOpen = false, onPreview }: { section: { id: string; title: string; lessons: Array<{ id: string; title: string; type: string; duration?: string | null; isPreview?: boolean }> }; defaultOpen?: boolean; onPreview: (lessonId: string) => void }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:bg-slate-800 transition-colors text-left select-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-slate-400 dark:text-slate-500">{isOpen ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}</span>
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm md:text-base">{section.title}</h4>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">{section.lessons.length} bài học</span>
      </button>
      
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
          {section.lessons.map((lesson) => (
            <div
              key={lesson.id}
              onClick={() => (lesson.isPreview ? onPreview(lesson.id) : toast.info('Hãy mua khóa học để xem bài này.'))}
              className="p-3 pl-4 md:pl-11 flex items-center justify-between group hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {lesson.isPreview ? (
                  <PlayCircle size={16} className="flex-shrink-0 fill-indigo-100 text-indigo-600" />
                ) : (
                  <Lock size={14} className="flex-shrink-0 text-slate-400 dark:text-slate-500" />
                )}
                <span className={`text-sm truncate group-hover:text-indigo-700 ${lesson.isPreview ? 'text-slate-900 dark:text-slate-50 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                    {lesson.title}
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-2">
                {lesson.isPreview && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full hidden sm:inline-block">Học thử</span>}
                <span className="text-xs text-slate-400 dark:text-slate-500">{lesson.duration}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RelatedCourseCard = ({ course }: { course: { id: string; title: string; instructor: string; rating: number; reviews: number; price: number; originalPrice?: number; thumbnail: string; tag?: string } }) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer group">
    <div className="relative aspect-video overflow-hidden rounded-t-xl">
        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {course.tag && (
            <span className="absolute top-2 left-2 bg-white dark:bg-slate-900/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded text-slate-800 dark:text-slate-100 shadow-sm">{course.tag}</span>
        )}
    </div>
    <div className="p-4 flex flex-col flex-1">
        <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{course.instructor}</p>
        <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1">
                <span className="text-amber-500 font-bold text-xs">{course.rating}</span>
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-xs text-slate-400 dark:text-slate-500">({course.reviews})</span>
            </div>
            <span className="font-semibold text-primary text-sm">{formatVND(course.price)}</span>
        </div>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---

const CourseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = id || '';
  const { data: courseData, isLoading, error } = useCourse(courseId);

  useSEO({
    title: courseData?.title || 'Chi tiết khóa học',
    description: courseData?.detail?.description?.slice(0, 160) || undefined,
    image: courseData?.thumbnail || undefined,
  });

  // Fetch related courses (same category, falling back to same instructor / featured)
  const { data: relatedCoursesData } = useRelatedCourses(courseId, 4);

  const { user: currentUser } = useAuthStatus();
  const navigate = useNavigate();

  // Xem thử: video giới thiệu khoá hoặc một bài học thử
  const [previewLessonId, setPreviewLessonId] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const previewQuery = usePreviewLesson(previewLessonId);

  // Reviews
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewSort, setReviewSort] = useState<'newest' | 'helpful' | 'highest' | 'lowest'>('newest');
  const [reviewStarFilter, setReviewStarFilter] = useState<number | undefined>(undefined);
  const [onlyWithComment, setOnlyWithComment] = useState(false);
  const { data: reviewsData, isLoading: isLoadingReviews } = useReviewsByCourse(courseId, {
    page: reviewsPage,
    limit: 5,
    sort: reviewSort,
    rating: reviewStarFilter,
    hasComment: onlyWithComment ? true : undefined,
  });
  // Gộp các trang đã tải (bấm "Xem thêm" thì nối thêm, không thay cả danh sách); đổi bộ lọc thì bắt đầu lại từ trang 1
  const [loadedReviews, setLoadedReviews] = useState<Review[]>([]);
  useEffect(() => {
    if (!reviewsData) return;
    setLoadedReviews((prev) =>
      reviewsPage === 1 ? reviewsData.data : [...prev, ...reviewsData.data.filter((r) => !prev.some((p) => p.id === r.id))],
    );
  }, [reviewsData, reviewsPage]);
  const helpfulMutation = useSetReviewHelpful();
  const handleHelpful = (review: Review) => {
    const on = !review.markedHelpful;
    helpfulMutation.mutate(
      { reviewId: review.id, on },
      {
        onSuccess: (r) =>
          setLoadedReviews((list) => list.map((x) => (x.id === review.id ? { ...x, helpfulCount: r.helpfulCount, markedHelpful: r.markedHelpful } : x))),
      },
    );
  };
  const changeReviewFilter = (apply: () => void) => {
    apply();
    setReviewsPage(1);
  };
  const { data: myReview, refetch: refetchMyReview } = useMyReview(courseId);
  const { data: wishlistCheck } = useCheckWishlist(courseId);
  const isInWishlist = wishlistCheck?.isInWishlist || false;
  
  const createReviewMutation = useCreateReview();

  // Hooks must be called at the top level, before any early returns
  const addToCartMutation = useAddToCart();
  
  const addToWishlistMutation = useAddToWishlist();
  const removeFromWishlistMutation = useRemoveFromWishlist();
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  const handleAddToCart = (courseId: string) => {
    addToCartMutation.mutate(courseId);
  };
  const handleBuyNow = (id: string) => {
    // Chỉ thêm vào giỏ rồi mở giỏ hàng (checkout mua toàn bộ giỏ nên không đi thẳng)
    addToCartMutation.mutate(id, { onSuccess: () => navigate('/cart') });
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: courseData?.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép liên kết khóa học.');
    } catch {
      // người dùng đóng hộp thoại chia sẻ: không cần báo lỗi
    }
  };

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlistMutation.mutate(courseId);
    } else {
      addToWishlistMutation.mutate(courseId);
    }
  };

  const handleSubmitReview = () => {
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }

    const body: CreateReviewBody = {
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
    };

    createReviewMutation.mutate(
      { courseId, body },
      {
        onSuccess: () => {
          setShowReviewForm(false);
          setReviewComment('');
          setReviewRating(5);
          refetchMyReview();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Không thể tải khóa học. Vui lòng thử lại sau.</p>
          <Link to="/courses" className="text-indigo-600 hover:underline">
            Quay lại danh sách khóa học
          </Link>
        </div>
      </div>
    );
  }

  // Use API data directly (already in correct format)
  const course = courseData;

  // Phân bố sao thật do backend tính trên toàn bộ đánh giá của khóa
  const totalRatings = Object.values(course.ratingDistribution).reduce((sum, n) => sum + n, 0);
  const percentageOf = (star: number) =>
    totalRatings > 0 ? Math.round((course.ratingDistribution[star as 1 | 2 | 3 | 4 | 5] / totalRatings) * 100) : 0;
  const languageLabel = LANGUAGE_LABELS[course.language] || course.language;
  const firstPreviewLessonId = course.content.flatMap((sec) => sec.lessons).find((l) => l.isPreview)?.id ?? null;
  const canPlayIntro = !!course.introVideo || !!firstPreviewLessonId;
  const openIntro = () => {
    if (course.introVideo) setShowIntro(true);
    else if (firstPreviewLessonId) setPreviewLessonId(firstPreviewLessonId);
  };
  const previewSource = showIntro
    ? { title: `Giới thiệu: ${course.title}`, storageType: guessStorageType(course.introVideo || ''), url: course.introVideo }
    : previewQuery.data
      ? { lessonId: previewLessonId ?? undefined, title: previewQuery.data.title, storageType: previewQuery.data.storageType, url: previewQuery.data.storageUrl, text: previewQuery.data.contentText }
      : null;

  // Transform related courses
  const relatedCourses = (relatedCoursesData || [])
    .map(c => {
      const reviewsCount = c.reviewsCount || 0;
      const rating = reviewsCount > 0 && c.totalStars 
        ? Math.round((c.totalStars / reviewsCount) * 10) / 10 
        : 0;

      let tag = 'Mới';
      if (c.isFeatured) tag = 'Nổi bật';
      if (c.totalLearners && c.totalLearners > 100) tag = 'Bán chạy';
      if (c.price === 0) tag = 'Miễn phí';

      return {
        id: c.id,
        title: c.title,
        instructor: c.instructor?.name || 'Unknown',
        rating: rating || 0,
        reviews: reviewsCount,
        price: c.salePrice || c.price,
        originalPrice: c.salePrice ? c.price : undefined,
        thumbnail: c.thumbnail || PLACEHOLDER_IMAGE,
        tag,
      };
    });

  // Xử lý split string thành array để render list
  const objectivesList = course.detail?.objectives ? course.detail.objectives.split('\n').filter(o => o.trim()) : [];
  const requirementsList = course.detail?.requirements ? course.detail.requirements.split('\n').filter(r => r.trim()) : [];
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300">
      
      {/* 1. HERO SECTION */}
      <div className="bg-slate-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-30 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2 text-indigo-300 text-xs md:text-sm font-medium mb-4">
                <Link to="/courses" className="hover:text-white cursor-pointer">Khóa học</Link>
                <ChevronRight size={14} />
                {course.category && (
                  <Link to={course.category.id ? `/courses?categoryId=${course.category.id}` : '/courses'} className="hover:text-white cursor-pointer">{course.category.name}</Link>
                )}
                {!course.category && <span className="text-white">Khác</span>}
                <ChevronRight size={14} />
                <span className="text-white truncate max-w-[150px] md:max-w-xs">{course.title}</span>
              </div>
              
              <h1 className="text-2xl md:text-4xl font-semibold leading-tight tracking-tight">{course.title}</h1>
              {course.detail?.description && <p className="text-base md:text-lg text-slate-300 line-clamp-2">{course.detail.description}</p>}
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                 <div className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                    <span className="font-bold">{course.rating}</span>
                    <div className="flex"><Star size={14} fill="currentColor"/></div>
                 </div>
                 <button
                   type="button"
                   onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                   className="text-slate-300 underline decoration-slate-600 underline-offset-4 hover:text-white hover:decoration-white"
                 >
                   ({course.reviewsCount} đánh giá)
                 </button>
                 <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>
                 <span className="text-slate-300">{course.studentsCount.toLocaleString()} học viên</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm">
                 <Link to={`/instructors/${course.instructor.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src={course.instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&background=random`} alt="" className="w-8 h-8 rounded-full border border-white/20" />
                    <span>Được dạy bởi <span className="font-bold text-white hover:underline">{course.instructor.name}</span></span>
                 </Link>
                 <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 lg:ml-4">
                    <AlertCircle size={14} /> Cập nhật lần cuối {course.updatedAt}
                 </div>
                 <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                    <Globe size={14} /> {languageLabel}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT & SIDEBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-10 order-2 lg:order-1">
             
             {/* Objectives */}
             <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">Bạn sẽ học được gì?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {objectivesList.map((obj, i) => (
                      <div key={i} className="flex gap-3 items-start">
                         <Check size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                         <span className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{obj}</span>
                      </div>
                   ))}
                </div>
             </section>

             {/* Content */}
             <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight">Nội dung khóa học</h2>
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                     {course.content.length} phần • {course.totalLessons} bài học • {course.totalDuration}
                  </div>
                </div>
                <div>
                   {course.content.map((sec, i) => (
                      <AccordionItem key={sec.id} section={sec} defaultOpen={i === 0} onPreview={setPreviewLessonId} />
                   ))}
                </div>
             </section>

             {/* Requirements & Description */}
             <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Yêu cầu & Mô tả</h2>
                <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-200 text-sm marker:text-indigo-600 mb-6">
                   {requirementsList.map((req, i) => (
                      <li key={i}>{req}</li>
                   ))}
                </ul>
                <div className="text-slate-700 dark:text-slate-200 leading-relaxed text-sm space-y-4 text-justify">
                   {course.detail?.description && <p>{course.detail.description}</p>}
                   {course.detail?.targetAudience && (
                     <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <p className="font-bold text-indigo-900 mb-1">Đối tượng:</p>
                        <p className="text-indigo-800">{course.detail.targetAudience}</p>
                     </div>
                   )}
                </div>
             </section>

             {/* Instructor */}
             <section>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">Giảng viên</h2>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                   <Link to={`/instructors/${course.instructor.id}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 hover:opacity-90 transition-opacity">
                      <img src={course.instructor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&background=random`} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                      <div>
                         <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50 hover:text-indigo-600">{course.instructor.name}</h3>
                         <div className="flex gap-4 text-xs text-slate-600 dark:text-slate-300 mt-2">
                            <div className="flex items-center gap-1"><Star size={14} className="text-amber-500" /> {course.instructor.rating} Đánh giá</div>
                            <div className="flex items-center gap-1"><Users size={14} /> {(course.instructor.students || 0).toLocaleString()} Học viên</div>
                            <div className="flex items-center gap-1"><PlayCircle size={14} /> {course.instructor.courses} Khóa học</div>
                         </div>
                      </div>
                   </Link>
                   {course.instructor.bio && <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-4 mt-4">{course.instructor.bio}</p>}
                </div>
             </section>

             {/* REVIEWS SECTION */}
             <section id="reviews">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2 tracking-tight">
                      Đánh giá từ học viên <span className="text-sm font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{reviewsData?.total || course.reviewsCount || 0}</span>
                  </h2>
                  {!myReview && !showReviewForm && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
                    >
                      <Edit3 size={14} /> Viết đánh giá
                    </button>
                  )}
                </div>

                {/* My Review */}
                {myReview && !showReviewForm && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Star size={18} className="text-indigo-600 fill-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">Đánh giá của bạn</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < myReview.rating ? "currentColor" : "none"} className={i >= myReview.rating ? "text-slate-200" : ""} />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400 dark:text-slate-500">• {new Date(myReview.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowReviewForm(true);
                          setReviewRating(myReview.rating);
                          setReviewComment(myReview.comment || '');
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                    {myReview.comment && (
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{myReview.comment}</p>
                    )}
                  </div>
                )}

                {/* Review Form */}
                {showReviewForm && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-slate-50">
                        {myReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá của bạn'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewComment('');
                          setReviewRating(5);
                        }}
                        className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Đánh giá</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              size={32}
                              className={star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Nhận xét (tùy chọn)</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
                        className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSubmitReview}
                        disabled={createReviewMutation.isPending}
                        className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {createReviewMutation.isPending ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          'Gửi đánh giá'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewComment('');
                          setReviewRating(5);
                        }}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-50 dark:bg-slate-950 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Rating Summary */}
                {totalRatings > 0 && (
                  <div className="flex items-center gap-8 mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-slate-900 dark:text-slate-50 mb-1">{course.rating}</div>
                      <div className="flex justify-center text-amber-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill={i < Math.round(course.rating) ? "currentColor" : "none"} className={i >= Math.round(course.rating) ? "text-slate-200" : ""} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Xếp hạng khóa học</p>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map(star => {
                        const percentage = percentageOf(star);
                        return (
                          <div key={star} className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="w-2">{star}</span>
                            <Star size={10} className="text-slate-300" />
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-amber-400 rounded-full transition-all" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="w-8 text-right">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bộ lọc và sắp xếp đánh giá */}
                {(course.reviewsCount > 0 || reviewStarFilter || onlyWithComment) && (
                  <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
                    <select
                      value={reviewSort}
                      onChange={(e) => changeReviewFilter(() => setReviewSort(e.target.value as typeof reviewSort))}
                      className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      aria-label="Sắp xếp đánh giá"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="helpful">Hữu ích nhất</option>
                      <option value="highest">Điểm cao nhất</option>
                      <option value="lowest">Điểm thấp nhất</option>
                    </select>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <button
                        key={star}
                        onClick={() => changeReviewFilter(() => setReviewStarFilter(reviewStarFilter === star ? undefined : star))}
                        className={`px-3 py-1.5 rounded-full border ${reviewStarFilter === star ? 'bg-amber-400 border-amber-400 text-white' : 'border-slate-200 dark:border-slate-800 hover:border-amber-300'}`}
                      >
                        {star} ★
                      </button>
                    ))}
                    <label className="inline-flex items-center gap-2 ml-1 cursor-pointer">
                      <input type="checkbox" checked={onlyWithComment} onChange={(e) => changeReviewFilter(() => setOnlyWithComment(e.target.checked))} className="accent-indigo-600" />
                      Có nhận xét
                    </label>
                  </div>
                )}

                {/* Review List */}
                {isLoadingReviews && loadedReviews.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
                  </div>
                ) : loadedReviews.length > 0 ? (
                  <>
                    <div className="space-y-6">
                      {loadedReviews.map(review => (
                        <div key={review.id} className="border-b border-slate-100 dark:border-slate-800 pb-6 last:border-none">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={review.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'User')}&background=random`} 
                                alt={review.user?.name || 'User'} 
                                className="w-10 h-10 rounded-full object-cover bg-slate-200 dark:bg-slate-700" 
                              />
                              <div>
                                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">{review.user?.name || 'Người dùng'}</h4>
                                <div className="flex items-center gap-2">
                                  <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-slate-200" : ""} />
                                    ))}
                                  </div>
                                  <span className="text-xs text-slate-400 dark:text-slate-500">• {new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                              </div>
                            </div>
                            {currentUser?.id && review.userId !== currentUser.id && (
                              <ReportButton targetType="REVIEW" targetId={review.id} />
                            )}
                          </div>
                          {review.comment && (
                            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-3">{review.comment}</p>
                          )}
                          {currentUser?.id && review.userId !== currentUser.id ? (
                            <button
                              onClick={() => handleHelpful(review)}
                              disabled={helpfulMutation.isPending}
                              className={`mt-1 mb-2 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                                review.markedHelpful ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-indigo-300'
                              }`}
                            >
                              <ThumbsUp size={13} className={review.markedHelpful ? 'fill-current' : ''} /> Hữu ích{review.helpfulCount ? ` (${review.helpfulCount})` : ''}
                            </button>
                          ) : (
                            !!review.helpfulCount && <p className="text-xs text-slate-500 mb-2">{review.helpfulCount} người thấy hữu ích</p>
                          )}
                          {review.instructorReply && (
                            <div className="ml-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-900 mt-2">
                              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">Phản hồi từ giảng viên</p>
                              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{review.instructorReply}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {reviewsData && reviewsData.totalPages > reviewsPage && (
                      <button
                        onClick={() => setReviewsPage(prev => prev + 1)}
                        className="w-full py-2.5 mt-4 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:bg-slate-950 transition-colors"
                      >
                        Xem thêm đánh giá ({Math.max(0, reviewsData!.total - loadedReviews.length)} còn lại)
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <p>Chưa có đánh giá nào cho khóa học này.</p>
                    {!myReview && !showReviewForm && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Hãy là người đầu tiên đánh giá!
                      </button>
                    )}
                  </div>
                )}
             </section>
          </div>

          {/* RIGHT COLUMN: STICKY BUY CARD */}
          <div className="lg:col-span-1 relative order-1 lg:order-2">
             <div className="sticky top-24 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-900/10 overflow-hidden lg:-mt-48 relative z-20">
                   <div
                     className={`relative aspect-video group bg-slate-900 ${canPlayIntro ? 'cursor-pointer' : ''}`}
                     onClick={canPlayIntro ? openIntro : undefined}
                   >
                      <img src={course.thumbnail || PLACEHOLDER_IMAGE} alt="" className="w-full h-full object-cover opacity-80" />
                      {canPlayIntro && (
                        <>
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <PlayCircle size={32} className="text-indigo-600 fill-indigo-600 ml-1" />
                             </div>
                          </div>
                          <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-medium">Xem giới thiệu</div>
                        </>
                      )}
                   </div>

                   <div className="p-6">
                      <div className="flex items-end gap-3 mb-6">
                         <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">{formatVND(course.salePrice || course.price)}</span>
                         {course.originalPrice && course.originalPrice > (course.salePrice || course.price) && (
                            <span className="text-slate-400 dark:text-slate-500 line-through mb-1 text-sm font-medium">{formatVND(course.originalPrice)}</span>
                         )}
                         {course.originalPrice && course.originalPrice > (course.salePrice || course.price) && (
                           <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded ml-auto mb-1">
                              -{Math.round((1 - (course.salePrice || course.price)/course.originalPrice)*100)}%
                           </span>
                         )}
                      </div>

                      <div className="space-y-3 mb-6">
                         <button
                            onClick={() => handleBuyNow(course.id)}
                            disabled={addToCartMutation.isPending}
                            className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-50"
                         >
                            Mua ngay
                         </button>
                         <div className="flex gap-3">
                            <button 
                              onClick={() => handleAddToCart(course.id)} 
                              disabled={addToCartMutation.isPending}
                              className="flex-1 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:bg-slate-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {addToCartMutation.isPending ? 'Đang thêm...' : 'Thêm vào giỏ'}
                            </button>
                            <button 
                              onClick={handleToggleWishlist}
                              disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
                              className={`relative px-4 py-3.5 border rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                                isInWishlist 
                                  ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-400 active:scale-95 shadow-sm shadow-red-100' 
                                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-950 hover:border-red-200 hover:text-red-500 active:scale-95'
                              }`}
                            >
                              {(addToWishlistMutation.isPending || removeFromWishlistMutation.isPending) ? (
                                <Loader2 size={20} className="animate-spin text-current" />
                              ) : (
                                <Heart 
                                  size={20} 
                                  className={`transition-all ${isInWishlist ? 'fill-current scale-110' : ''}`} 
                                />
                              )}
                              {course.totalWishlist && course.totalWishlist > 0 && (
                                <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold rounded-full ${
                                  isInWishlist 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-indigo-600 text-white'
                                }`}>
                                  {course.totalWishlist > 99 ? '99+' : course.totalWishlist}
                                </span>
                              )}
                            </button>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm">Khóa học này bao gồm:</h4>
                         <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                            <li className="flex items-center gap-3"><MonitorPlay size={18} className="text-slate-400 dark:text-slate-500"/> {course.totalDuration} video bài giảng ({course.stats.videoLessons} bài)</li>
                            {course.stats.textLessons > 0 && (
                              <li className="flex items-center gap-3"><FileText size={18} className="text-slate-400 dark:text-slate-500"/> {course.stats.textLessons} bài viết</li>
                            )}
                            {course.stats.quizzes > 0 && (
                              <li className="flex items-center gap-3"><Code size={18} className="text-slate-400 dark:text-slate-500"/> {course.stats.quizzes} bài kiểm tra</li>
                            )}
                            {course.stats.materials > 0 && (
                              <li className="flex items-center gap-3"><Award size={18} className="text-slate-400 dark:text-slate-500"/> {course.stats.materials} tài liệu đính kèm</li>
                            )}
                            <li className="flex items-center gap-3"><Clock size={18} className="text-slate-400 dark:text-slate-500"/> Truy cập trọn đời</li>
                            <li className="flex items-center gap-3"><Globe size={18} className="text-slate-400 dark:text-slate-500"/> Học trên mọi thiết bị</li>
                         </ul>
                      </div>
                   </div>
                   
                   <div
                     onClick={handleShare}
                     className="border-t border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-950"
                   >
                      <span>Chia sẻ khóa học</span>
                      <Share2 size={18} />
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* 3. RELATED COURSES (FULL WIDTH BOTTOM) */}
        {relatedCourses.length > 0 && (
          <div className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-16">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-8">Khóa học liên quan</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedCourses.map(rc => (
                      <Link key={rc.id} to={`/courses/${rc.id}`}>
                          <RelatedCourseCard course={rc} />
                      </Link>
                  ))}
              </div>
          </div>
        )}

      </div>
      <MediaPreviewModal
        open={showIntro || !!previewLessonId}
        onClose={() => { setShowIntro(false); setPreviewLessonId(null); }}
        isLoading={!showIntro && previewQuery.isLoading}
        error={!showIntro && previewQuery.isError ? 'Không thể tải bài học thử.' : null}
        source={previewSource}
      />
    </div>
  );
};

export default CourseDetailPage;
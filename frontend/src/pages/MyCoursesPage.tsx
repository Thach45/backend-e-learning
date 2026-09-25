import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, 
  BookOpen, 
  Heart,
  Filter
} from 'lucide-react';
import { useMyEnrollments } from '../hooks/useEnrollments';
import { useMyWishlist } from '../hooks/useWishlist';
import { useRemoveFromWishlist } from '../hooks/useWishlist';
import type { Enrollment } from '../api/enrollments';
import type { WishlistItem } from '../api/wishlist';
import AchievementsWidget from '../components/common/AchievementsWidget';

const formatVND = (amount: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// Transform enrollment to display format
const transformEnrollment = (enrollment: Enrollment) => {
  // completedAt = thời điểm ghi danh thành công
  // Tất cả enrollments đều là đã ghi danh thành công
  return {
    id: enrollment.id,
    courseId: enrollment.courseId,
    title: enrollment.course?.title || 'Unknown Course',
    instructor: enrollment.course?.instructor?.name || 'Unknown',
    thumbnail: enrollment.course?.thumbnail || 'https://via.placeholder.com/400x300?text=No+Image',
    enrolledAt: enrollment.enrolledAt,
  };
};

const LearningCard = ({ course }: { course: ReturnType<typeof transformEnrollment> }) => {
 

  return (
    <Link to={`/learn/course/${course.courseId}`}>
      <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
          
          {/* Overlay Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              <PlayCircle size={28} className="text-indigo-600 fill-indigo-600 ml-1" />
            </div>
          </div>

        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{course.instructor}</p>
        </div>
      </div>
    </Link>
  );
};

const WishlistCard = ({ item, onRemove }: { item: WishlistItem; onRemove: () => void }) => {
  const course = item.course;
  if (!course) return null;

  const price = course.salePrice || course.price;

  return (
    <div className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-200 transition-colors">
      <Link to={`/courses/${course.id}`} className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden relative">
        <img 
          src={course.thumbnail || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt="" 
          className="w-full h-full object-cover" 
        />
      </Link>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/courses/${course.id}`}>
            <h4 className="font-bold text-slate-900 dark:text-slate-50 text-sm line-clamp-1 hover:text-indigo-600">{course.title}</h4>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400">{course.instructor?.name || 'Unknown'}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-indigo-600 font-bold text-sm">{formatVND(price)}</span>
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                onRemove();
              }}
              className="p-1.5  text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Heart size={16} fill="currentColor" />
            </button>
            <Link 
              to={`/courses/${course.id}`}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Mua ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

const MyCoursesPage = () => {

  // Fetch enrollments - chỉ lấy những enrollments đã ghi danh thành công (completedAt != null)
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useMyEnrollments({
    page: 1,
    limit: 100,
    completed: true, // Chỉ lấy enrollments đã ghi danh thành công
  });

  // Fetch wishlist
  const { data: wishlistData, isLoading: wishlistLoading } = useMyWishlist({
    page: 1,
    limit: 5,
  });

  const removeFromWishlistMutation = useRemoveFromWishlist();

  // Transform enrollments
  const courses = useMemo(() => {
    if (!enrollmentsData?.data) return [];
    return enrollmentsData.data.map(transformEnrollment);
  }, [enrollmentsData]);

  // Filter logic - tạm thời chỉ hiển thị tất cả
  // Status sẽ được implement sau dựa trên LearningProgress
  const filteredCourses = useMemo(() => {
    return courses;
  }, [courses]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
         
         {/* Main Content Area */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Main Course List (Left) */}
            <div className="lg:col-span-8 space-y-6">
               {/* Header */}
               <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Khóa học của tôi</h1>
                  
                  {/* Filter Mobile/Desktop */}
                  {/* <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950">
                     <Filter size={16} /> <span className="hidden sm:inline">Sắp xếp</span>
                  </button> */}
               </div>

               
               {/* Grid */}
               {enrollmentsLoading ? (
                  <div className="text-center py-16">
                     <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                     <p className="mt-4 text-slate-500 dark:text-slate-400">Đang tải khóa học...</p>
                  </div>
               ) : (
                  <>
                     {filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {filteredCourses.map(course => (
                              <LearningCard key={course.id} course={course} />
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                           <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                              <BookOpen size={32} />
                           </div>
                           <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-2">Chưa có khóa học nào</h3>
                           <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Bạn chưa đăng ký khóa học nào ở mục này.</p>
                           <Link 
                              to="/courses"
                              className="inline-block px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                           >
                              Khám phá khóa học ngay
                           </Link>
                        </div>
                     )}
                  </>
               )}
            </div>

            {/* Sidebar (Right) */}
            <div className="lg:col-span-4 space-y-6">

               <AchievementsWidget />

               {/* Wishlist */}
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-bold text-slate-900 dark:text-slate-50">Danh sách yêu thích</h3>
                     <Link to="/wishlist" className="text-xs font-bold text-indigo-600 hover:underline">Xem tất cả</Link>
                  </div>
                  {wishlistLoading ? (
                     <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                     </div>
                  ) : wishlistData?.data && wishlistData.data.length > 0 ? (
                     <div className="space-y-3">
                        {wishlistData.data.map(item => (
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
                  ) : (
                     <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có khóa học yêu thích</p>
                     </div>
                  )}
               </div>

               {/* Recommended Topic Tags */}
               <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-4 text-sm uppercase tracking-wider">Chủ đề gợi ý cho bạn</h3>
                  <div className="flex flex-wrap gap-2">
                     {['ReactJS', 'System Design', 'English for IT', 'Leadership', 'Data Analysis'].map(tag => (
                        <span 
                           key={tag} 
                           className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 cursor-pointer transition-colors"
                        >
                           {tag}
                        </span>
                     ))}
                  </div>
               </div>

            </div>
         </div>

      </main>
    </div>
  );
};

export default MyCoursesPage;

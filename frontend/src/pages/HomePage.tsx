import HeroSection from '../components/home/HeroSection';
import CategoriesSection, { type Category } from '../components/home/CategoriesSection';
import FeaturedCoursesSection, { type Course } from '../components/home/FeaturedCoursesSection';
import NewsletterSection from '../components/home/NewsletterSection';
import ContinueWatchingSection from '../components/home/ContinueWatchingSection';
import { useCategories } from '../hooks/useCategories';
import { useCourses } from '../hooks/useCourses';
import { useSEO } from '../hooks/useSEO';
import { useMemo } from 'react';

const formatVND = (amount: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const HomePage = () => {
  useSEO({
    title: 'Nền tảng học tập trực tuyến',
    description: 'Khám phá hàng trăm khóa học chất lượng cao từ các giảng viên hàng đầu trên U Đê Mê.',
  });

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  
  // Fetch featured courses
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useCourses({
    page: 1,
    limit: 8,
    isFeatured: true,
    status: 'PUBLISHED',
  });

  // Transform categories data
  const categories: Category[] = useMemo(() => {
    if (!categoriesData) return [];

    return categoriesData
      .filter(cat => !cat.parentId) // Public API now returns tree roots here
      .slice(0, 6) // Limit to 6 categories
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        count: cat.countCourses || 0,
        imageUrl: cat.imageUrl,
      }));
  }, [categoriesData]);

  // Transform courses data
  const courses: Course[] = useMemo(() => {
    if (!coursesData?.data) return [];
    
    return coursesData.data.map((course) => {
      // Calculate rating from totalStars and reviewsCount
      const reviewsCount = course.reviewsCount || 0;
      const rating = reviewsCount > 0 && course.totalStars 
        ? Math.round((course.totalStars / reviewsCount) * 10) / 10 
        : 0;

      // Determine tag based on course properties
      let tag = 'Mới';
      if (course.isFeatured) tag = 'Nổi bật';
      if (course.totalLearners && course.totalLearners > 100) tag = 'Bán chạy';
      if (course.price === 0) tag = 'Miễn phí';

      // Format duration from seconds to "Xh Ym" format
      const formatDuration = (seconds: number): string => {
        if (!seconds || seconds === 0) return '0h 0m';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
      };

      return {
        id: course.id,
        title: course.title,
        instructor: course.instructor?.name || 'Unknown',
        rating: rating || 0,
        reviews: course.reviewsCount || 0,
        price: course.salePrice || course.price,
        oldPrice: course.salePrice ? course.price : 0,
        thumbnail: course.thumbnail || 'https://via.placeholder.com/400x300?text=No+Image',
        tag,
        lessons: course.totalLessons || 0,
        duration: formatDuration(course.totalDuration || 0),
      };
    });
  }, [coursesData]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        <HeroSection />
        {/* <PurchaseFlowSection /> */}
        {/* <TrustedCompaniesSection /> */}
        <ContinueWatchingSection />

        {/* Categories Section */}
        {categoriesLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Đang tải danh mục...</p>
          </div>
        ) : categoriesError ? (
          <div className="text-center py-12">
            <p className="text-red-500">Không thể tải danh mục. Vui lòng thử lại sau.</p>
          </div>
        ) : categories.length > 0 ? (
          <CategoriesSection categories={categories} />
        ) : null}

        {/* Featured Courses Section */}
        {coursesLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Đang tải khóa học...</p>
          </div>
        ) : coursesError ? (
          <div className="text-center py-12">
            <p className="text-red-500">Không thể tải khóa học. Vui lòng thử lại sau.</p>
          </div>
        ) : courses.length > 0 ? (
          <FeaturedCoursesSection courses={courses} formatPrice={formatVND} />
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">Chưa có khóa học nổi bật nào.</p>
          </div>
        )}

        <NewsletterSection />
      </main>
    </div>
  );
};

export default HomePage;
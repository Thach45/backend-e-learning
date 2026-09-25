import { useState, useMemo, useEffect, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  Heart, 
  Star, 
  MonitorPlay, 
  TrendingUp, 
  Filter, 
  Grid, 
  List,
  Check
} from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useCourses } from '../hooks/useCourses';
import { useSEO } from '../hooks/useSEO';
import type { Course as CourseType, CourseListParams } from '../api/courses';
import { PLACEHOLDER_IMAGE } from '../utils/placeholder';


const formatVND = (amount: number) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

// Level mapping
const LEVEL_MAP = {
  'BEGINNER': 'Cơ bản',
  'INTERMEDIATE': 'Trung cấp',
  'ADVANCED': 'Nâng cao',
} as const;

const LEVELS: { value: CourseListParams['level']; label: string }[] = [
  { value: 'BEGINNER', label: 'Cơ bản' },
  { value: 'INTERMEDIATE', label: 'Trung cấp' },
  { value: 'ADVANCED', label: 'Nâng cao' },
];

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

// Transform API course to display format
const transformCourse = (course: CourseType) => {
  // Calculate rating
  const reviewsCount = course.reviewsCount || 0;
  const rating = reviewsCount > 0 && course.totalStars 
    ? Math.round((course.totalStars / reviewsCount) * 10) / 10 
    : 0;

  // Determine tag
  let tag = 'Mới';
  if (course.isFeatured) tag = 'Nổi bật';
  if (course.totalLearners && course.totalLearners > 100) tag = 'Bán chạy';
  if (course.price === 0) tag = 'Miễn phí';

  return {
    id: course.id,
    title: course.title,
    instructor: course.instructor?.name || 'Unknown',
    rating: rating || 0,
    reviews: reviewsCount,
    price: course.salePrice || course.price,
    oldPrice: course.salePrice ? course.price : 0,
    thumbnail: course.thumbnail || PLACEHOLDER_IMAGE,
    tag,
    lessons: course.totalLessons || 0,
    duration: formatDuration(course.totalDuration || 0),
    level: course.level ? LEVEL_MAP[course.level] : 'Mọi cấp độ',
    category: course.category?.name || 'Khác',
    categoryId: course.categoryId,
  };
};


const CourseCard = ({ course }: { course: ReturnType<typeof transformCourse> }) => (
    <Link to={`/courses/${course.id}`}>   
        <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden rounded-t-2xl">
                <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute top-3 left-3 bg-white dark:bg-slate-900/95 backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded text-slate-800 dark:text-slate-100 shadow-sm uppercase tracking-wide border border-slate-100 dark:border-slate-800">
                {course.tag}
                </div>
                
                <button className="absolute top-3 right-3 w-8 h-8 bg-black/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white dark:bg-slate-900 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                <Heart size={16} fill="currentColor" className="text-current" />
                </button>
            </div>
            
            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300"><MonitorPlay size={12} className="text-primary"/> {course.lessons} bài</span>
                <span className="flex items-center gap-1.5"><TrendingUp size={12}/> {course.duration}</span>
                </div>
                
                <h3 className="font-semibold text-[17px] text-slate-900 dark:text-slate-50 mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {course.title}
                </h3>

                <div className="mb-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm">{course.category}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-4 mt-auto">
                <img src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`} alt="" className="w-6 h-6 rounded-full border border-white shadow-sm" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{course.instructor}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-slate-50 text-sm">{course.rating}</span>
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">({course.reviews})</span>
                </div>
                <div className="text-right">
                    {course.price > 0 ? (
                        <div className="flex flex-col items-end">
                            <div className="font-bold text-primary text-lg">{formatVND(course.price)}</div>
                            {course.oldPrice > course.price && <div className="text-xs text-slate-400 dark:text-slate-500 line-through">{formatVND(course.oldPrice)}</div>}
                        </div>
                    ) : (
                        <div className="font-bold text-emerald-600 uppercase text-sm bg-emerald-50 px-2 py-1 rounded">Miễn phí</div>
                    )}
                </div>
                </div>
            </div>
        </div>
    </Link>
);


// --- MAIN PAGE: COURSE LISTING ---

const CourseListPage = () => {
  useSEO({
    title: 'Khóa học',
    description: 'Duyệt qua danh sách khóa học đa dạng, từ lập trình, thiết kế đến kỹ năng mềm, phù hợp mọi trình độ.',
  });

  // Toàn bộ bộ lọc nằm trên URL (?search=&categoryId=a,b&level=&sort=&page=) nên tải lại trang hay gửi link vẫn giữ nguyên kết quả.
  const [searchParams, setSearchParams] = useSearchParams();
  const LEVEL_VALUES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
  const SORT_VALUES = ['popular', 'newest', 'price-low', 'price-high'] as const;
  const searchQuery = searchParams.get('search')?.trim() ?? '';
  const selectedCategoryIds = useMemo(() => (searchParams.get('categoryId') ?? '').split(',').filter(Boolean), [searchParams]);
  const levelParam = searchParams.get('level') as CourseListParams['level'];
  const selectedLevel: CourseListParams['level'] | null = (LEVEL_VALUES as readonly string[]).includes(levelParam ?? '') ? levelParam : null;
  const sortParam = searchParams.get('sort') ?? 'popular';
  const sortBy = (SORT_VALUES as readonly string[]).includes(sortParam) ? sortParam : 'popular';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);

  /** Cập nhật URL: giá trị rỗng hoặc mặc định thì bỏ khỏi URL; đổi bộ lọc (không phải trang) thì về trang 1. */
  const updateParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '' || (k === 'sort' && v === 'popular') || (k === 'page' && v === '1')) next.delete(k);
      else next.set(k, v);
    }
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next);
  };
  const setPage = (p: number) => updateParams({ page: String(p) });

  // Ô nhập chỉ là bản nháp: chỉ khi bấm nút tìm hoặc Enter mới ghi lên URL và gọi API (không gọi theo từng phím gõ)
  const [searchDraft, setSearchDraft] = useState(searchQuery);
  useEffect(() => setSearchDraft(searchQuery), [searchQuery]);

  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const limit = 12;

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  type CategoryNode = {
    id: string;
    name: string;
    countCourses: number;
    children?: CategoryNode[];
  };

  const categoryTree = useMemo(() => (categoriesData || []) as CategoryNode[], [categoriesData]);

  // Handle initial expansion of categories without using useEffect to avoid cascading renders
  const [hasExpandedInitially, setHasExpandedInitially] = useState(false);
  if (categoryTree.length > 0 && !hasExpandedInitially) {
    setExpandedCategoryIds(categoryTree.map(node => node.id));
    setHasExpandedInitially(true);
  }

  // Build API params
  const apiParams = useMemo(() => {
    const params: CourseListParams = {
      page,
      limit,
      status: 'PUBLISHED',
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (selectedCategoryIds.length > 0) {
      params.categoryId = selectedCategoryIds.join(',');
    }

    params.sort = sortBy as NonNullable<CourseListParams['sort']>;

    if (selectedLevel) {
      params.level = selectedLevel;
    }

    return params;
  }, [page, limit, searchQuery, selectedCategoryIds, selectedLevel, sortBy]);

  // Fetch courses
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useCourses(apiParams);

  // Transform courses
  const courses = useMemo(() => {
    if (!coursesData?.data) return [];
    
    // Lọc theo danh mục và sắp xếp đều do backend làm trên toàn bộ kết quả, nên phân trang luôn khớp
    const transformed = coursesData.data.map(transformCourse);

    return transformed;
  }, [coursesData]);

  const toggleCategory = (categoryId: string) => {
    const next = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter(id => id !== categoryId)
      : [...selectedCategoryIds, categoryId];
    updateParams({ categoryId: next.join(',') });
  };

  const toggleExpandCategory = (categoryId: string) => {
    setExpandedCategoryIds(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };

  const renderCategoryTree = (nodes: CategoryNode[], depth = 0): ReactNode[] => {
    return nodes.flatMap((node) => {
      const hasChildren = !!node.children && node.children.length > 0;
      const isExpanded = expandedCategoryIds.includes(node.id);
      const paddingLeft = 8 + depth * 16;

      if (hasChildren) {
        const parentRow = (
          <button
            key={`parent-${node.id}`}
            type="button"
            onClick={() => toggleExpandCategory(node.id)}
            style={{ paddingLeft }}
            className="w-full flex items-center justify-between py-2 pr-2 rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <ChevronRight
                size={14}
                className={`text-slate-400 dark:text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{node.name}</span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">{node.countCourses}</span>
          </button>
        );

        if (!isExpanded) {
          return [parentRow];
        }

        return [parentRow, ...renderCategoryTree(node.children || [], depth + 1)];
      }

      return [
        <label
          key={`leaf-${node.id}`}
          style={{ paddingLeft }}
          className="w-full flex items-center gap-3 py-2 pr-2 rounded-lg cursor-pointer group select-none hover:bg-slate-100 dark:bg-slate-800"
        >
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${selectedCategoryIds.includes(node.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400'}`}>
            {selectedCategoryIds.includes(node.id) && <Check size={14} className="text-white" />}
          </div>
          <input
            type="checkbox"
            className="hidden"
            onChange={() => toggleCategory(node.id)}
            checked={selectedCategoryIds.includes(node.id)}
          />
          <span className={`text-sm flex-1 transition-colors ${selectedCategoryIds.includes(node.id) ? 'text-slate-900 dark:text-slate-50 font-semibold' : 'text-slate-600 dark:text-slate-300 group-hover:text-indigo-600'}`}>
            {node.name}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{node.countCourses}</span>
        </label>,
      ];
    });
  };

  const handleLevelChange = (level: CourseListParams['level'] | null) => {
    updateParams({ level: level ?? null });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchDraft.trim() });
  };
  
  
  const totalPages = coursesData ? Math.ceil(coursesData.total / coursesData.limit) : 1;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-3 space-y-8 sticky top-24">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <Filter size={20} className="text-primary"/> 
                        <span className="font-semibold text-slate-900 dark:text-slate-50">Bộ Lọc Tìm Kiếm</span>
                    </div>
                    
                    <div className="space-y-8">
                        {/* Search */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Tìm kiếm</h3>
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    value={searchDraft}
                                    onChange={(e) => setSearchDraft(e.target.value)}
                                    placeholder="Tìm khóa học..."
                                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600">
                                    <Search size={18} />
                                </button>
                            </form>
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Danh mục</h3>
                            {categoriesLoading ? (
                                <div className="text-center py-4">
                                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : (
                                <div className="max-h-72 overflow-y-auto pr-1 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50 py-2">
                                  {renderCategoryTree(categoryTree)}
                                </div>
                            )}
                        </div>

                        {/* Levels */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Trình độ</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="radio" 
                                        name="level" 
                                        className="w-4 h-4 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer" 
                                        checked={selectedLevel === null}
                                        onChange={() => handleLevelChange(null)}
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Mọi cấp độ</span>
                                </label>
                                {LEVELS.map((level) => (
                                    <label key={level.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input 
                                            type="radio" 
                                            name="level" 
                                            className="w-4 h-4 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer" 
                                            checked={selectedLevel === level.value}
                                            onChange={() => handleLevelChange(level.value)}
                                        />
                                        <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">{level.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
                {/* Filters Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Tất cả khóa học</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Hiển thị <span className="font-bold text-slate-900 dark:text-slate-50">{coursesData?.total || 0}</span> kết quả phù hợp
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="relative group">
                            <select 
                                value={sortBy}
                                onChange={(e) => updateParams({ sort: e.target.value })}
                                className="appearance-none bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-medium cursor-pointer hover:border-slate-300 dark:border-slate-700 transition-colors"
                            >
                                <option value="popular">Phổ biến nhất</option>
                                <option value="newest">Mới nhất</option>
                                <option value="price-low">Giá: Thấp đến Cao</option>
                                <option value="price-high">Giá: Cao đến Thấp</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                        </div>
                        
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-300'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Course Listing */}
                {coursesLoading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-slate-500 dark:text-slate-400">Đang tải khóa học...</p>
                    </div>
                ) : coursesError ? (
                    <div className="text-center py-16">
                        <p className="text-red-500">Không thể tải khóa học. Vui lòng thử lại sau.</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-slate-500 dark:text-slate-400">Không tìm thấy khóa học nào.</p>
                    </div>
                ) : (
                    <>
                        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                            {courses.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-16 flex justify-center">
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <button 
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className="w-10 h-10 rounded-xl border border-transparent flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-950 hover:text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ←
                                    </button>
                                    
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (page <= 3) {
                                            pageNum = i + 1;
                                        } else if (page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = page - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-colors ${
                                                    page === pageNum
                                                        ? 'bg-primary text-white shadow-md shadow-indigo-200'
                                                        : 'border border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    
                                    {totalPages > 5 && page < totalPages - 2 && (
                                        <span className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 pb-2">...</span>
                                    )}
                                    
                                    <button 
                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                        disabled={page === totalPages}
                                        className="w-10 h-10 rounded-xl border border-transparent flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <CourseListPage />
      </main>
      
    </div>
  );
};

export default App;
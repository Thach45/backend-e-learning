import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useCreateInstructorCourse } from '../../hooks/useInstructorCourses';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import ImageUpload from '../../components/common/ImageUpload';
import type { CourseLevel } from '../../api/instructor';

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const createMutation = useCreateInstructorCourse();
  const { data: categories, isLoading: categoriesLoading } = useAdminCategories();
  const leafCategories = (categories || []).filter(
    (category) => !(categories || []).some((item) => item.parentId === category.id)
  );

  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    salePrice: '',
    thumbnail: '',
    introVideo: '',
    isFeatured: false,
    level: 'BEGINNER' as CourseLevel,
    categoryId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.title.trim()) {
      setErrors({ title: 'Vui lòng nhập tiêu đề khóa học' });
      return;
    }

    if (formData.price < 0) {
      setErrors({ price: 'Giá không được âm' });
      return;
    }

    const salePrice = formData.salePrice ? parseFloat(formData.salePrice) : undefined;
    if (salePrice !== undefined && salePrice < 0) {
      setErrors({ salePrice: 'Giá khuyến mãi không được âm' });
      return;
    }

    if (salePrice !== undefined && salePrice >= formData.price) {
      setErrors({ salePrice: 'Giá khuyến mãi phải nhỏ hơn giá gốc' });
      return;
    }

    createMutation.mutate(
      {
        title: formData.title.trim(),
        price: formData.price,
        salePrice: salePrice,
        thumbnail: formData.thumbnail || undefined,
        introVideo: formData.introVideo || undefined,
        isFeatured: formData.isFeatured,
        level: formData.level,
        categoryId: formData.categoryId || undefined,
        status: 'DRAFT',
      },
      {
        onSuccess: (course) => {
          navigate(`/instructor/courses/${course.id}/edit`);
        },
        onError: (error: any) => {
          setErrors({ general: error.response?.data?.message || 'Có lỗi xảy ra khi tạo khóa học' });
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/instructor/courses')}
          className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Tạo khóa học mới</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Điền thông tin cơ bản để tạo khóa học</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        {errors.general && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-rose-600" size={20} />
            <p className="text-rose-700 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Tiêu đề khóa học <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
              errors.title ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
            }`}
            placeholder="Ví dụ: Full Stack Web Development 2025"
            required
          />
          {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
        </div>

        {/* Price & Sale Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Giá khóa học (VND) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
                errors.price ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
              }`}
              placeholder="299000"
              required
            />
            {errors.price && <p className="mt-1 text-xs text-rose-600">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Giá khuyến mãi (VND) <span className="text-slate-400 dark:text-slate-500 text-xs">(tùy chọn)</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.salePrice}
              onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all ${
                errors.salePrice ? 'border-rose-300 bg-rose-50' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
              }`}
              placeholder="199000"
            />
            {errors.salePrice && <p className="mt-1 text-xs text-rose-600">{errors.salePrice}</p>}
          </div>
        </div>

        {/* Level & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Cấp độ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as CourseLevel })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
            >
              <option value="BEGINNER">Cơ bản</option>
              <option value="INTERMEDIATE">Trung bình</option>
              <option value="ADVANCED">Nâng cao</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Danh mục <span className="text-slate-400 dark:text-slate-500 text-xs">(tùy chọn)</span>
            </label>
            {categoriesLoading ? (
              <div className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-slate-400 dark:text-slate-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Đang tải...</span>
              </div>
            ) : (
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
              >
                <option value="">Chọn danh mục</option>
                {leafCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        <ImageUpload
          value={formData.thumbnail}
          onChange={(url) => setFormData({ ...formData, thumbnail: url })}
          label="Hình ảnh thumbnail"
          required={false}
        />

        {/* Intro Video */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Link video giới thiệu <span className="text-slate-400 dark:text-slate-500 text-xs">(tùy chọn)</span>
          </label>
          <input
            type="url"
            value={formData.introVideo}
            onChange={(e) => setFormData({ ...formData, introVideo: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        {/* Featured */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isFeatured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="w-5 h-5 text-purple-600 border-slate-300 dark:border-slate-700 rounded focus:ring-purple-500"
          />
          <label htmlFor="isFeatured" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Đánh dấu là khóa học nổi bật
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/instructor/courses')}
            className="px-6 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:bg-slate-950 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {createMutation.isPending && <Loader2 size={18} className="animate-spin" />}
            {createMutation.isPending ? 'Đang tạo...' : 'Tạo khóa học'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCoursePage;


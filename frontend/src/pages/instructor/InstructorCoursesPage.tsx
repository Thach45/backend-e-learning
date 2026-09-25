import { useState } from 'react';
import { Search, Plus, Edit, Trash2, FileText, Users, DollarSign, Loader2, AlertCircle, Eye, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInstructorCourses, useDeleteInstructorCourse, useRequestApproval } from '../../hooks/useInstructorCourses';
import type { CourseStatus } from '../../api/instructor';

const InstructorCoursesPage = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useInstructorCourses({
    status: selectedStatus === 'ALL' ? undefined : selectedStatus as CourseStatus,
    search: searchTerm || undefined,
  });

  const deleteMutation = useDeleteInstructorCourse();
  const requestApprovalMutation = useRequestApproval();

  const courses = data?.data || [];

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getStatusBadge = (status: CourseStatus) => {
    const map: Record<CourseStatus, { label: string; color: string }> = {
      PUBLISHED: { label: 'Đã xuất bản', color: 'bg-emerald-50 text-emerald-700' },
      DRAFT: { label: 'Bản nháp', color: 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200' },
      PENDING_PUBLISHED: { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-700' },
      PENDING_DRAFT: { label: 'Chờ duyệt xóa', color: 'bg-orange-50 text-orange-700' },
      ARCHIVED: { label: 'Đã lưu trữ', color: 'bg-rose-50 text-rose-700' },
    };
    return map[status] || { label: status, color: 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200' };
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleRequestApproval = (id: string) => {
    requestApprovalMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Khóa học của tôi</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý tất cả khóa học bạn đã tạo</p>
        </div>
        <Link 
          to="/instructor/courses/new"
          className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-500 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Tạo khóa học mới
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 focus:bg-white dark:bg-slate-900 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'PUBLISHED', 'DRAFT', 'PENDING_PUBLISHED'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                selectedStatus === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {status === 'ALL' ? 'Tất cả' : 
               status === 'PUBLISHED' ? 'Đã xuất bản' : 
               status === 'DRAFT' ? 'Bản nháp' : 'Chờ duyệt'}
            </button>
          ))}
        </div>
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
            <p className="font-semibold text-rose-800">Có lỗi xảy ra</p>
            <p className="text-sm text-rose-600">Không thể tải danh sách khóa học. Vui lòng thử lại.</p>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {!isLoading && !error && (
        <>
          {courses.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-4">Bạn chưa có khóa học nào.</p>
              <Link
                to="/instructor/courses/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-500 transition-colors"
              >
                <Plus size={18} />
                Tạo khóa học đầu tiên
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const statusBadge = getStatusBadge(course.status);
                return (
                  <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                    {course.thumbnail && (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-xl mb-4"
                      />
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 line-clamp-2 flex-1">{course.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.color} ml-2 whitespace-nowrap`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        <span>{(course.totalLearners || 0).toLocaleString()} học viên</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        <span className="font-semibold text-slate-800 dark:text-slate-100">
                          {course.salePrice && course.salePrice < course.price ? (
                            <>
                              <span className="line-through text-slate-400 dark:text-slate-500 mr-2">{formatVND(course.price)}</span>
                              <span className="text-rose-600">{formatVND(course.salePrice)}</span>
                            </>
                          ) : (
                            formatVND(course.price)
                          )}
                        </span>
                      </div>
                      {course.category && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Danh mục: {course.category.name}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        to={`/instructor/courses/${course.id}/content`}
                        className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 font-semibold rounded-lg hover:bg-purple-100 transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <FileText size={16} />
                        Nội dung
                      </Link>
                      <Link
                        to={`/instructor/courses/${course.id}/edit`}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-colors"
                      >
                        <Edit size={16} />
                      </Link>
                      <Link
                        to={`/instructor/courses/${course.id}/preview`}
                        title="Xem trước như học viên"
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/instructor/courses/${course.id}/insights`}
                        title="Phân tích rời bỏ & khảo sát"
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-colors"
                      >
                        <BarChart3 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id)}
                        disabled={deleteMutation.isPending}
                        className="px-3 py-2 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-semibold rounded-lg hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {course.status === 'DRAFT' && (
                      <button
                        onClick={() => handleRequestApproval(course.id)}
                        disabled={requestApprovalMutation.isPending}
                        className="w-full mt-3 px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors text-sm disabled:opacity-50"
                      >
                        {requestApprovalMutation.isPending ? 'Đang gửi...' : 'Yêu cầu duyệt'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InstructorCoursesPage;


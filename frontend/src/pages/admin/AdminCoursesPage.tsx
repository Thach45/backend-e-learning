import { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAdminCourses, useApprovePublish, useRejectPublish, useApproveDelete, useRejectDelete } from '../../hooks/useAdminCourses';
import CourseDetailModal from '../../components/admin/CourseDetailModal';
import type { CourseStatus, CourseLevel } from '../../api/admin';
import ExportCsvButton from '../../components/admin/ExportCsvButton';

const AdminCoursesPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [viewingCourseId, setViewingCourseId] = useState<string | null>(null);

  const { data, isLoading, error } = useAdminCourses({
    page,
    limit: 10,
    search: searchTerm || undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus as CourseStatus : undefined,
    level: selectedLevel !== 'ALL' ? selectedLevel as CourseLevel : undefined,
  });

  const approvePublishMutation = useApprovePublish();
  const rejectPublishMutation = useRejectPublish();
  const approveDeleteMutation = useApproveDelete();
  const rejectDeleteMutation = useRejectDelete();

  const courses = data?.data || [];
  const totalPages = data?.totalPages || 1;

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

  const getLevelBadge = (level: CourseLevel) => {
    const map: Record<CourseLevel, { label: string; color: string }> = {
      BEGINNER: { label: 'Cơ bản', color: 'bg-blue-50 text-blue-700' },
      INTERMEDIATE: { label: 'Trung bình', color: 'bg-purple-50 text-purple-700' },
      ADVANCED: { label: 'Nâng cao', color: 'bg-red-50 text-red-700' },
    };
    return map[level] || { label: level, color: 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200' };
  };

  const handleApprovePublish = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn duyệt xuất bản khóa học này?')) {
      approvePublishMutation.mutate(id);
    }
  };

  const handleRejectPublish = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối xuất bản khóa học này?')) {
      rejectPublishMutation.mutate(id);
    }
  };

  const handleApproveDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn duyệt xóa khóa học này?')) {
      approveDeleteMutation.mutate(id);
    }
  };

  const handleRejectDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối xóa khóa học này?')) {
      rejectDeleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý khóa học</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý tất cả khóa học trong hệ thống</p>
        </div>
        <ExportCsvButton resource="courses" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học hoặc giảng viên..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:bg-white dark:bg-slate-900 outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Lọc theo:</span>
          <div className="flex gap-2">
            {['ALL', 'PUBLISHED', 'DRAFT', 'PENDING_PUBLISHED', 'PENDING_DRAFT', 'ARCHIVED'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {status === 'ALL' ? 'Tất cả' : 
                 status === 'PUBLISHED' ? 'Đã xuất bản' : 
                 status === 'DRAFT' ? 'Bản nháp' : 
                 status === 'PENDING_PUBLISHED' ? 'Chờ duyệt' : 
                 status === 'PENDING_DRAFT' ? 'Chờ duyệt xóa' : 'Đã lưu trữ'}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-4">
            {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setSelectedLevel(level);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  selectedLevel === level
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {level === 'ALL' ? 'Tất cả cấp độ' : 
                 level === 'BEGINNER' ? 'Cơ bản' : 
                 level === 'INTERMEDIATE' ? 'Trung bình' : 'Nâng cao'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
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

      {/* Courses Table */}
      {!isLoading && !error && (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Khóa học</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Giảng viên</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Cấp độ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Học viên</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        Không có khóa học nào
                      </td>
                    </tr>
                  ) : (
                    courses.map((course) => {
                      const statusBadge = getStatusBadge(course.status);
                      const levelBadge = getLevelBadge(course.level);
                      return (
                        <tr key={course.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">{course.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">ID: {course.id}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {course.instructor?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${levelBadge.color}`}>
                              {levelBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              {course.price > 0 ? formatVND(course.price) : 'Miễn phí'}
                            </span>
                            {course.salePrice && course.salePrice < course.price && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-through mt-1">
                                {formatVND(course.price)}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {course.totalLearners?.toLocaleString() || 0}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setViewingCourseId(course.id)}
                                className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <Eye size={16} />
                              </button>
                              {course.status === 'PENDING_PUBLISHED' && (
                                <>
                                  <button
                                    onClick={() => handleApprovePublish(course.id)}
                                    disabled={approvePublishMutation.isPending}
                                    className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Duyệt xuất bản"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleRejectPublish(course.id)}
                                    disabled={rejectPublishMutation.isPending}
                                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Từ chối xuất bản"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                              {course.status === 'PENDING_DRAFT' && (
                                <>
                                  <button
                                    onClick={() => handleApproveDelete(course.id)}
                                    disabled={approveDeleteMutation.isPending}
                                    className="p-2 text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Duyệt xóa"
                                  >
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleRejectDelete(course.id)}
                                    disabled={rejectDeleteMutation.isPending}
                                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Từ chối xóa"
                                  >
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
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

      {/* Course Detail Modal */}
      {viewingCourseId && (
        <CourseDetailModal
          courseId={viewingCourseId}
          onClose={() => setViewingCourseId(null)}
        />
      )}
    </div>
  );
};

export default AdminCoursesPage;

import { useState } from 'react';
import { Search, GraduationCap, Loader2, AlertCircle, Eye } from 'lucide-react';
import { useAdminEnrollments } from '../../hooks/useAdminEnrollments';
import { useAdminCourses } from '../../hooks/useAdminCourses';
import type { AdminEnrollment } from '../../api/admin';
import ExportCsvButton from '../../components/admin/ExportCsvButton';

const AdminEnrollmentsPage = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const { data: enrollmentsData, isLoading, error } = useAdminEnrollments({
    page,
    limit: 10,
    search: searchTerm || undefined,
    courseId: selectedCourse !== 'ALL' ? selectedCourse : undefined,
    completed: selectedStatus !== 'ALL' ? selectedStatus === 'COMPLETED' : undefined,
  });

  const { data: coursesData } = useAdminCourses({ limit: 100 });

  const enrollments = enrollmentsData?.data || [];
  const totalPages = enrollmentsData?.totalPages || 1;
  const courses = coursesData?.data || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateProgress = (enrollment: AdminEnrollment) => {
    // Progress có thể được tính từ learning progress hoặc từ backend
    // Ở đây tạm thời dùng progress từ enrollment nếu có
    return enrollment.progress || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Quản lý ghi danh</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Theo dõi tất cả ghi danh và tiến độ học tập</p>
        </div>
        <ExportCsvButton resource="enrollments" />
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc khóa học..."
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
            <select
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-100 outline-none"
            >
              <option value="ALL">Tất cả khóa học</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 ml-4">
            {['ALL', 'COMPLETED', 'IN_PROGRESS'].map((status) => (
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
                 status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang học'}
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

      {/* Enrollments Table */}
      {!isLoading && !error && (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Học viên</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Khóa học</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Ngày ghi danh</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Tiến độ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Ngày hoàn thành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {enrollments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        Không có ghi danh nào
                      </td>
                    </tr>
                  ) : (
                    enrollments.map((enrollment) => {
                      const progress = calculateProgress(enrollment);
                      const isCompleted = !!enrollment.completedAt;
                      return (
                        <tr key={enrollment.id} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {enrollment.user?.avatar ? (
                                <img
                                  src={enrollment.user.avatar}
                                  alt={enrollment.user.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <GraduationCap size={18} className="text-indigo-600" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100">{enrollment.user?.name || 'N/A'}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{enrollment.user?.email || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {enrollment.course?.thumbnail && (
                                <img
                                  src={enrollment.course.thumbnail}
                                  alt={enrollment.course.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{enrollment.course?.title || 'N/A'}</p>
                                {enrollment.course?.instructor && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400">GV: {enrollment.course.instructor.name}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {formatDate(enrollment.enrolledAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 min-w-[100px]">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    isCompleted ? 'bg-emerald-600' : 'bg-indigo-600'
                                  }`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 w-12 text-right">
                                {progress}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isCompleted ? (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                Đã hoàn thành
                              </span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                                Đang học
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {enrollment.completedAt ? formatDate(enrollment.completedAt) : '-'}
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
    </div>
  );
};

export default AdminEnrollmentsPage;

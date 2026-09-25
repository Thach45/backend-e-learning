import { useState } from 'react';
import { Search, Mail, Calendar, Loader2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import StudentProgressModal from '../../components/instructor/StudentProgressModal';
import { useExportStudentsCsv } from '../../hooks/useInstructorStudents';
import { useEnrolledStudents } from '../../hooks/useInstructor';
import { useInstructorCourses } from '../../hooks/useInstructorCourses';

const InstructorStudentsPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [detail, setDetail] = useState<{ courseId: string; userId: string } | null>(null);
  const exportCsv = useExportStudentsCsv();

  const { data: studentsData, isLoading } = useEnrolledStudents({
    page,
    limit,
    search: searchTerm || undefined,
    courseId: selectedCourseId || undefined,
  });

  const { data: coursesData } = useInstructorCourses({ limit: 100 });

  const students = studentsData?.data || [];
  const totalPages = studentsData?.totalPages || 1;
  const totalItems = studentsData?.totalItems ?? studentsData?.total ?? 0;
  const courses = coursesData?.data || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Học viên của tôi</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý học viên đã ghi danh vào khóa học của bạn</p>
        </div>
        <button
          onClick={() => exportCsv.mutate({ courseId: selectedCourseId || undefined, search: searchTerm || undefined })}
          disabled={exportCsv.isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          {exportCsv.isPending ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Xuất CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email hoặc khóa học..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 focus:bg-white dark:bg-slate-900 outline-none"
            />
          </div>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 focus:bg-white dark:bg-slate-900 outline-none"
          >
            <option value="">Tất cả khóa học</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Students Table */}
      {!isLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {students.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">Chưa có học viên nào đăng ký khóa học của bạn.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-950">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Học viên</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Khóa học</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Ngày ghi danh</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Tiến độ</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Trạng thái</th>
                    
                      <th className="px-6 py-3" /></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {students.map((student) => {
                      const displayName = student.user?.name?.trim() || 'Học viên';
                      const displayEmail = student.user?.email || 'Chưa có email';
                      const displayCourseTitle = student.course?.title || 'Chưa có tên khóa học';
                      const avatarInitial = displayName.charAt(0).toUpperCase();

                      return (
                      <tr key={`${student.userId}-${student.courseId}`} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {student.user?.avatar ? (
                              <img 
                                src={student.user.avatar} 
                                alt={displayName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-600 font-semibold">
                                  {avatarInitial}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{displayName}</p>
                              <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                <Mail size={14} />
                                {displayEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{displayCourseTitle}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                            <Calendar size={14} />
                            {formatDate(student.enrolledAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 min-w-[100px]">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  (student.progress || 0) === 100 ? 'bg-emerald-600' : 'bg-purple-600'
                                }`}
                                style={{ width: `${student.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 w-12 text-right">
                              {student.progress || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {student.completedAt ? (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                              Đã hoàn thành
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200">
                              Đang học
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setDetail({ courseId: student.courseId, userId: student.userId })} className="text-sm font-semibold text-purple-700 hover:underline">Chi tiết</button>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-6 py-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Trang {page} / {totalPages} (Tổng: {totalItems} học viên)
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoading}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm flex items-center gap-1 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} /> Trước
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isLoading}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm flex items-center gap-1 hover:bg-slate-50 dark:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Tiếp <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {detail && <StudentProgressModal courseId={detail.courseId} userId={detail.userId} onClose={() => setDetail(null)} />}
    </div>
  );
};

export default InstructorStudentsPage;

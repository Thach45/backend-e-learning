import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useInstructorCourse } from '../../hooks/useInstructorCourses';
import CourseContentManager from '../../components/instructor/CourseContentManager';

const CourseContentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: course, isLoading: courseLoading, error: courseError } = useInstructorCourse(id || '');

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-center gap-3">
          <AlertCircle className="text-rose-600" size={24} />
          <div>
            <p className="font-semibold text-rose-800">Không tìm thấy khóa học</p>
            <p className="text-sm text-rose-600">Khóa học không tồn tại hoặc bạn không có quyền chỉnh sửa.</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/instructor/courses')}
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-500 transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/instructor/courses/${id}/edit`)}
          className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Nội dung khóa học</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{course.title}</p>
        </div>
      </div>

      {/* Course Content Manager */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <CourseContentManager courseId={id || ''} />
      </div>
    </div>
  );
};

export default CourseContentPage;


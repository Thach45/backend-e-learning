import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, TrendingDown, Star, ThumbsUp } from 'lucide-react';
import { useInstructorCourse } from '../../hooks/useInstructorCourses';
import { useCourseDropoffAnalytics } from '../../hooks/useInstructor';
import { useSurveyResults } from '../../hooks/useCourseSurvey';

const InstructorCourseInsightsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'DROPOFF' | 'SURVEY'>('DROPOFF');

  const { data: course } = useInstructorCourse(id || '');
  const { data: dropoff, isLoading: dropoffLoading } = useCourseDropoffAnalytics(id || '');
  const { data: survey, isLoading: surveyLoading } = useSurveyResults(id || '');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/instructor/courses')}
          className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Phân tích khóa học</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{course?.title}</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('DROPOFF')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'DROPOFF' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 dark:text-slate-400'
          }`}
        >
          <TrendingDown size={16} /> Tỷ lệ rời bỏ
        </button>
        <button
          onClick={() => setActiveTab('SURVEY')}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'SURVEY' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 dark:text-slate-400'
          }`}
        >
          <Star size={16} /> Kết quả khảo sát
        </button>
      </div>

      {activeTab === 'DROPOFF' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          {dropoffLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>
          ) : dropoff && dropoff.lessons.length > 0 ? (
            <div className="space-y-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tổng {dropoff.totalEnrollments} học viên đã ghi danh. Biểu đồ dưới đây cho thấy tỷ lệ học viên tiếp cận và hoàn thành từng bài học, theo thứ tự trong khóa học.
              </p>
              <div className="space-y-3">
                {dropoff.lessons.map((lesson, idx) => (
                  <div key={lesson.lessonId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate mr-4">
                        {idx + 1}. {lesson.lessonTitle}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {lesson.reached} tiếp cận • {lesson.completed} hoàn thành
                        {lesson.dropoffRate > 0 && (
                          <span className="ml-2 text-rose-600 font-semibold">−{lesson.dropoffRate}% rời bỏ</span>
                        )}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-indigo-400"
                        style={{ width: `${Math.min(100, lesson.reachRate)}%` }}
                        title={`Tiếp cận: ${lesson.reachRate}%`}
                      />
                    </div>
                    <div className="w-full h-1.5 bg-transparent">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, lesson.completionRate)}%` }}
                        title={`Hoàn thành: ${lesson.completionRate}%`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400 pt-2">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-400 inline-block" /> Tiếp cận</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-emerald-500 inline-block" /> Hoàn thành</span>
              </div>
            </div>
          ) : (
            <p className="text-center py-12 text-slate-500 dark:text-slate-400">Chưa có dữ liệu để phân tích.</p>
          )}
        </div>
      )}

      {activeTab === 'SURVEY' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          {surveyLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>
          ) : survey && survey.totalResponses > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{survey.totalResponses}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lượt khảo sát</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{survey.averageDifficulty}/5</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Độ khó trung bình</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{survey.averageSatisfaction}/5</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hài lòng trung bình</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <ThumbsUp size={16} /> {survey.recommendPercent}% học viên sẽ giới thiệu khóa học này
              </div>

              {survey.feedback.some((f) => f.feedback) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider">Góp ý từ học viên</h3>
                  {survey.feedback.filter((f) => f.feedback).map((f) => (
                    <div key={f.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{f.userName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{f.feedback}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-center py-12 text-slate-500 dark:text-slate-400">Chưa có phản hồi khảo sát nào.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default InstructorCourseInsightsPage;

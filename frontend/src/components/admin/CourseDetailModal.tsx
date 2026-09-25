import { Loader2, X, Play, Clock, FileText, Video } from 'lucide-react';
import { useState } from 'react';
import { useAdminCourse } from '../../hooks/useAdminCourses';

type CourseDetailModalProps = {
  courseId: string;
  onClose: () => void;
};

const CourseDetailModal = ({ courseId, onClose }: CourseDetailModalProps) => {
  const { data: course, isLoading, error } = useAdminCourse(courseId);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    // Handle YouTube video ID or full URL
    let videoId = url;
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || url;
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || url;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const renderVideoPlayer = (lesson: any) => {
    if (lesson.storageType === 'YOUTUBE' && lesson.storageUrl) {
      return (
        <div className="aspect-video w-full">
          <iframe
            src={getYouTubeEmbedUrl(lesson.storageUrl)}
            title={lesson.title}
            className="w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    } else if (lesson.storageType === 'CLOUDINARY' && lesson.storageUrl) {
      return (
        <div className="aspect-video w-full">
          <video
            src={lesson.storageUrl}
            controls
            className="w-full h-full rounded-lg"
          >
            Trình duyệt của bạn không hỗ trợ video.
          </video>
        </div>
      );
    }
    return (
      <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Không có video</p>
      </div>
    );
  };

  const renderContentTree = (contents: any[], level = 0) => {
    return contents.map((content) => (
      <div key={content.id} className={`${level > 0 ? 'ml-6 mt-4' : 'mt-4'}`}>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-indigo-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">{content.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {content.lessons?.length || 0} bài học
                </p>
              </div>
            </div>
          </div>
          
          {content.lessons && content.lessons.length > 0 && (
            <div className="p-4 space-y-3">
              {content.lessons.map((lesson: any) => (
                <div
                  key={lesson.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedLesson === lesson.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-950'
                  }`}
                  onClick={() => setSelectedLesson(lesson.id === selectedLesson ? null : lesson.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Video size={18} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-slate-800 dark:text-slate-100">{lesson.title}</h5>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className={`px-2 py-0.5 rounded ${
                              lesson.storageType === 'YOUTUBE' 
                                ? 'bg-red-50 text-red-700' 
                                : 'bg-blue-50 text-blue-700'
                            }`}>
                              {lesson.storageType}
                            </span>
                          </span>
                          {lesson.duration && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatDuration(lesson.duration)}
                            </span>
                          )}
                        </div>
                        {lesson.contentText && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                            {lesson.contentText}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLesson(lesson.id === selectedLesson ? null : lesson.id);
                      }}
                    >
                      <Play size={18} />
                    </button>
                  </div>
                  
                  {selectedLesson === lesson.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                      {renderVideoPlayer(lesson)}
                      {lesson.contentText && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Mô tả bài học:</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{lesson.contentText}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {content.children && content.children.length > 0 && (
          <div className="mt-2">
            {renderContentTree(content.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Chi tiết khóa học</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                <p className="text-rose-800">Lỗi khi tải dữ liệu</p>
              </div>
            </div>
          )}

          {course && (
            <div className="p-6 space-y-6">
              {/* Course Header with Thumbnail and Intro Video */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  {course.thumbnail && (
                    <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div>
                  {course.introVideo && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Video giới thiệu</h3>
                      <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <iframe
                          src={getYouTubeEmbedUrl(course.introVideo)}
                          title="Intro Video"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tiêu đề</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{course.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Giảng viên</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{course.instructor?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Danh mục</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{course.category?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Giá</p>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {course.price > 0 ? formatVND(course.price) : 'Miễn phí'}
                      </p>
                      {course.salePrice && course.salePrice < course.price && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-through mt-1">
                          {formatVND(course.price)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Cấp độ</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      course.level === 'BEGINNER' ? 'bg-blue-50 text-blue-700' :
                      course.level === 'INTERMEDIATE' ? 'bg-purple-50 text-purple-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {course.level === 'BEGINNER' ? 'Cơ bản' :
                       course.level === 'INTERMEDIATE' ? 'Trung bình' : 'Nâng cao'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Trạng thái</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      course.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' :
                      course.status === 'DRAFT' ? 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200' :
                      course.status === 'PENDING_PUBLISHED' ? 'bg-amber-50 text-amber-700' :
                      course.status === 'PENDING_DRAFT' ? 'bg-orange-50 text-orange-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      {course.status === 'PUBLISHED' ? 'Đã xuất bản' :
                       course.status === 'DRAFT' ? 'Bản nháp' :
                       course.status === 'PENDING_PUBLISHED' ? 'Chờ duyệt' :
                       course.status === 'PENDING_DRAFT' ? 'Chờ duyệt xóa' : 'Đã lưu trữ'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Học viên</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{course.totalLearners?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Đánh giá</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{course.totalStars || 0} sao</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Yêu thích</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{course.totalLikes?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Nổi bật</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {course.isFeatured ? 'Có' : 'Không'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Ngày tạo</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {new Date(course.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Cập nhật</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {new Date(course.updatedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Detail */}
              {course.courseDetail && (
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Chi tiết khóa học</h3>
                  {course.courseDetail.description && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Mô tả</p>
                      <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{course.courseDetail.description}</p>
                    </div>
                  )}
                  {course.courseDetail.content && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Nội dung</p>
                      <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{course.courseDetail.content}</p>
                    </div>
                  )}
                  {course.courseDetail.objectives && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Mục tiêu</p>
                      <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{course.courseDetail.objectives}</p>
                    </div>
                  )}
                  {course.courseDetail.requirements && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Yêu cầu</p>
                      <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{course.courseDetail.requirements}</p>
                    </div>
                  )}
                  {course.courseDetail.targetAudience && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Đối tượng</p>
                      <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{course.courseDetail.targetAudience}</p>
                    </div>
                  )}
                  {course.courseDetail.benefits && (
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Lợi ích</p>
                      <p className="text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{course.courseDetail.benefits}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Course Contents */}
              {course.courseContents && course.courseContents.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Nội dung khóa học</h3>
                  <div className="space-y-2">
                    {renderContentTree(course.courseContents)}
                  </div>
                </div>
              )}

              {(!course.courseContents || course.courseContents.length === 0) && (
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400">
                  Khóa học chưa có nội dung
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailModal;


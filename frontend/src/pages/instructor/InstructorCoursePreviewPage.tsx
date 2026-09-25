import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, PlayCircle, FileText, Lock, Eye } from 'lucide-react';
import { useCoursePreviewContents, usePreviewLessonDetail } from '../../hooks/useInstructor';

const getYouTubeEmbedUrl = (url: string) => (url ? `https://www.youtube.com/embed/${url}` : null);

const getGoogleDriveEmbedUrl = (url: string) => {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return `https://drive.google.com/file/d/${trimmed}/preview`;
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match?.[1] ? `https://drive.google.com/file/d/${match[1]}/preview` : trimmed;
};

const InstructorCoursePreviewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const { data: contents, isLoading: contentsLoading } = useCoursePreviewContents(id || '');
  const firstLessonId = contents?.contents[0]?.lessons[0]?.id;
  const activeLessonId = selectedLessonId || firstLessonId || '';

  const { data: lesson, isLoading: lessonLoading } = usePreviewLessonDetail(id || '', activeLessonId);

  if (contentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const isEmbed = lesson?.storageType === 'YOUTUBE' || lesson?.storageType === 'GOOGLE_DRIVE';
  const embedUrl = isEmbed && lesson?.storageUrl
    ? lesson.storageType === 'YOUTUBE'
      ? getYouTubeEmbedUrl(lesson.storageUrl)
      : getGoogleDriveEmbedUrl(lesson.storageUrl)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/instructor/courses')} className="p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-slate-800 dark:text-slate-100">{contents?.courseTitle}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Eye size={12} /> Chế độ xem trước như học viên
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            {lessonLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : embedUrl ? (
              <iframe src={embedUrl} className="w-full h-full" allowFullScreen />
            ) : lesson?.storageUrl ? (
              <video src={lesson.storageUrl} controls className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <FileText size={48} />
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{lesson?.title}</h2>
            {lesson?.description && <p className="text-sm text-slate-500 dark:text-slate-400">{lesson.description}</p>}
            {lesson?.contentText && (
              <div className="prose prose-sm prose-slate max-w-none text-slate-700 dark:text-slate-200">
                <p>{lesson.contentText}</p>
              </div>
            )}
            {lesson?.transcript && (
              <details className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <summary className="px-4 py-3 cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-50">
                  Bản chép lời (transcript)
                </summary>
                <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{lesson.transcript}</div>
              </details>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 h-fit">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider mb-3">Nội dung khóa học</h3>
          <div className="space-y-3">
            {contents?.contents.map((section) => (
              <div key={section.id}>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{section.title}</p>
                <div className="space-y-1">
                  {section.lessons.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLessonId(l.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        l.id === activeLessonId
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {l.isLocked ? <Lock size={14} /> : <PlayCircle size={14} />}
                      <span className="flex-1 truncate">{l.title}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{l.duration}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorCoursePreviewPage;

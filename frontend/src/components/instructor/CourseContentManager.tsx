import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  Loader2,
  AlertCircle,
  GripVertical,
  ClipboardCheck,
} from 'lucide-react';
import {
  useCourseContents,
  useCreateCourseContent,
  useUpdateCourseContent,
  useDeleteCourseContent,
  useLessons,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from '../../hooks/useCourseContent';
import VideoUpload from '../common/VideoUpload';
import type { CourseContent, Lesson, StorageType } from '../../api/courseContent';
import { uploadApi } from '../../api/upload';


interface CourseContentManagerProps {
  courseId: string;
}

const CourseContentManager = ({ courseId }: CourseContentManagerProps) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [editingChapter, setEditingChapter] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ chapterId: string; lessonId: string } | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newLessonData, setNewLessonData] = useState<{
    title: string;
    storageType: StorageType;
    storageUrl: string;
    contentText: string;
    duration?: number;
    transcript: string;
    isPreview?: boolean;
  }>({
    title: '',
    storageType: 'CLOUDFLARE_R2',
    storageUrl: '',
    contentText: '',
    transcript: '',
  });


  const { data: contents, isLoading, error } = useCourseContents(courseId);
  const createChapterMutation = useCreateCourseContent();
  const updateChapterMutation = useUpdateCourseContent();
  const deleteChapterMutation = useDeleteCourseContent();
  const createLessonMutation = useCreateLesson();
  const updateLessonMutation = useUpdateLesson();
  const deleteLessonMutation = useDeleteLesson();

  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const handleCreateChapter = () => {
    if (!newChapterTitle.trim() || createChapterMutation.isPending) return;

    createChapterMutation.mutate(
      {
        courseId,
        body: {
          courseId: courseId,
          title: newChapterTitle.trim(),
          orderIndex: contents?.length || 0,
        },
      },
      {
        onSuccess: () => {
          setNewChapterTitle('');
        },
      }
    );
  };

  const handleUpdateChapter = (chapterId: string, title: string) => {
    if (updateChapterMutation.isPending) return;
    updateChapterMutation.mutate({
      courseId,
      id: chapterId,
      body: { title },
    });
    setEditingChapter(null);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (deleteChapterMutation.isPending) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa chương này? Tất cả bài học trong chương sẽ bị xóa.')) {
      deleteChapterMutation.mutate({ courseId, id: chapterId });
    }
  };

  const handleCreateLesson = (chapterId: string) => {
    if (!newLessonData.title.trim() || createLessonMutation.isPending) return;

    createLessonMutation.mutate(
      {
        courseId,
        contentId: chapterId,
        body: {
          contentId: chapterId,
          title: newLessonData.title.trim(),
          storageType: newLessonData.storageType,
          storageUrl: newLessonData.storageUrl || undefined,
          contentText: newLessonData.contentText || undefined,
          duration: parseInt(newLessonData.duration?.toString() || '0'),
          transcript: newLessonData.transcript || undefined,
          isPreview: newLessonData.isPreview ?? false,
        },
      },
      {
        onSuccess: (createdLesson: any) => {
          if (
            (createdLesson.storageType === 'CLOUDFLARE_R2' || createdLesson.storageType === 'DIRECT_UPLOAD') &&
            createdLesson.storageUrl
          ) {
            const isTranslate = createdLesson.storageType === 'CLOUDFLARE_R2';
            uploadApi.processVideo(createdLesson.id, createdLesson.storageUrl, isTranslate)
              .catch((err) => console.error('Failed to trigger Celery transcoding task:', err));
          }

          setNewLessonData({
            title: '',
            storageType: 'CLOUDFLARE_R2',
            storageUrl: '',
            contentText: '',
            transcript: '',
            isPreview: false,
          });
          toggleChapter(chapterId);
        },
      }
    );
  };


  const handleUpdateLesson = (chapterId: string, lessonId: string, lesson: Lesson) => {
    if (updateLessonMutation.isPending) return;
    updateLessonMutation.mutate(
      {
        courseId,
        contentId: chapterId,
        id: lessonId,
        body: {
          title: lesson.title,
          storageType: lesson.storageType,
          storageUrl: lesson.storageUrl,
          contentText: lesson.contentText,
          duration: lesson.duration,
          transcript: lesson.transcript,
          isPreview: lesson.isPreview,
        },
      },
      {
        onSuccess: (updatedLesson: any) => {
          if (
            (updatedLesson.storageType === 'CLOUDFLARE_R2' || updatedLesson.storageType === 'DIRECT_UPLOAD') &&
            updatedLesson.storageUrl
          ) {
            const isTranslate = updatedLesson.storageType === 'CLOUDFLARE_R2';
            uploadApi.processVideo(updatedLesson.id, updatedLesson.storageUrl, isTranslate)
              .catch((err) => console.error('Failed to trigger Celery transcoding task:', err));
          }
        }
      }
    );
    setEditingLesson(null);
  };


  const handleDeleteLesson = (chapterId: string, lessonId: string) => {
    if (deleteLessonMutation.isPending) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
      deleteLessonMutation.mutate({ courseId, contentId: chapterId, id: lessonId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="text-rose-600" size={24} />
        <div>
          <p className="font-semibold text-rose-800">Lỗi khi tải nội dung</p>
          <p className="text-sm text-rose-600">Không thể tải danh sách chương và bài học.</p>
        </div>
      </div>
    );
  }

  const chapters = contents || [];

  return (
    <div className="space-y-6">
      {/* Create New Chapter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateChapter();
              }
            }}
            placeholder="Nhập tên chương mới..."
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            disabled={createChapterMutation.isPending}
          />
          <button
            type="button"
            onClick={handleCreateChapter}
            disabled={createChapterMutation.isPending || !newChapterTitle.trim()}
            className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {createChapterMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            Thêm chương
          </button>
        </div>
      </div>

      {/* Chapters List */}
      <div className="space-y-3">
        {chapters.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400">Chưa có chương nào. Hãy tạo chương đầu tiên!</p>
          </div>
        ) : (
          chapters.map((chapter) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              courseId={courseId}
              isExpanded={expandedChapters.has(chapter.id)}
              onToggle={() => toggleChapter(chapter.id)}
              onEdit={() => setEditingChapter(chapter.id)}
              onDelete={() => handleDeleteChapter(chapter.id)}
              isUpdatingChapter={updateChapterMutation.isPending}
              isDeletingChapter={deleteChapterMutation.isPending}
              editingChapter={editingChapter}
              onUpdateTitle={(title) => handleUpdateChapter(chapter.id, title)}
              onCancelEdit={() => setEditingChapter(null)}
              newLessonData={newLessonData}
              onNewLessonChange={setNewLessonData}
              onCreateLesson={() => handleCreateLesson(chapter.id)}
              editingLesson={editingLesson}
              onEditLesson={setEditingLesson}
              onUpdateLesson={(lessonId, lesson) => handleUpdateLesson(chapter.id, lessonId, lesson)}
              onDeleteLesson={(lessonId) => handleDeleteLesson(chapter.id, lessonId)}
              isCreatingLesson={createLessonMutation.isPending}
              isUpdatingLesson={updateLessonMutation.isPending}
              isDeletingLesson={deleteLessonMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface ChapterItemProps {
  chapter: CourseContent;
  courseId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isUpdatingChapter: boolean;
  isDeletingChapter: boolean;
  editingChapter: string | null;
  onUpdateTitle: (title: string) => void;
  onCancelEdit: () => void;
  newLessonData: {
    title: string;
    storageType: StorageType;
    storageUrl: string;
    contentText: string;
    duration?: number;
    transcript: string;
    isPreview?: boolean;
  };
  onNewLessonChange: (data: any) => void;
  onCreateLesson: () => void;
  editingLesson: { chapterId: string; lessonId: string } | null;
  onEditLesson: (data: { chapterId: string; lessonId: string } | null) => void;
  onUpdateLesson: (lessonId: string, lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  isCreatingLesson: boolean;
  isUpdatingLesson: boolean;
  isDeletingLesson: boolean;
}

const ChapterItem = ({
  chapter,
  courseId,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  isUpdatingChapter,
  isDeletingChapter,
  editingChapter,
  onUpdateTitle,
  onCancelEdit,
  newLessonData,
  onNewLessonChange,
  onCreateLesson,
  editingLesson,
  onEditLesson,
  onUpdateLesson,
  onDeleteLesson,
  isCreatingLesson,
  isUpdatingLesson,
  isDeletingLesson,
}: ChapterItemProps) => {
  const { data: lessons, isLoading: lessonsLoading } = useLessons(courseId, chapter.id);
  const [editTitle, setEditTitle] = useState(chapter.title);

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      onUpdateTitle(editTitle.trim());
    } else {
      setEditTitle(chapter.title);
      onCancelEdit();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Chapter Header */}
      <div className="p-4 flex items-center gap-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors">
        <button
          type="button"
          onClick={onToggle}
          className="p-1 hover:bg-slate-200 dark:bg-slate-700 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          )}
        </button>

        {editingChapter === chapter.id ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') {
                  setEditTitle(chapter.title);
                  onCancelEdit();
                }
              }}
              className="flex-1 px-3 py-1.5 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={handleSaveTitle}
              disabled={isUpdatingChapter}
              className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isUpdatingChapter && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isUpdatingChapter ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditTitle(chapter.title);
                onCancelEdit();
              }}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm rounded-lg hover:bg-slate-300"
            >
              Hủy
            </button>
          </div>
        ) : (
          <>
            <h3 className="flex-1 font-semibold text-slate-800 dark:text-slate-100">{chapter.title}</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEdit}
                disabled={isUpdatingChapter || isDeletingChapter}
                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Chỉnh sửa"
              >
                <Edit2 size={16} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeletingChapter}
                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Xóa"
              >
                {isDeletingChapter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Lessons List */}
      {isExpanded && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          {lessonsLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600 mx-auto" />
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {/* Existing Lessons */}
              {(lessons || []).map((lesson) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  chapterId={chapter.id}
                  courseId={courseId}
                  isEditing={editingLesson?.chapterId === chapter.id && editingLesson?.lessonId === lesson.id}
                  onEdit={() => onEditLesson({ chapterId: chapter.id, lessonId: lesson.id })}
                  onCancelEdit={() => onEditLesson(null)}
                  onUpdate={(updatedLesson) => onUpdateLesson(lesson.id, updatedLesson)}
                  onDelete={() => onDeleteLesson(lesson.id)}
                  isUpdating={isUpdatingLesson}
                  isDeleting={isDeletingLesson}
                />
              ))}

              {/* Create New Lesson */}
              {editingLesson?.chapterId === chapter.id && editingLesson?.lessonId === 'new' ? (
                <NewLessonForm
                  courseId={courseId}
                  chapterId={chapter.id}
                  data={newLessonData}
                  onChange={onNewLessonChange}
                  onSubmit={onCreateLesson}
                  onCancel={() => onEditLesson(null)}
                  isSubmitting={isCreatingLesson}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onEditLesson({ chapterId: chapter.id, lessonId: 'new' })}
                  className="w-full p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Thêm bài học
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface LessonItemProps {
  lesson: Lesson;
  chapterId: string;
  courseId: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (lesson: Lesson) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

const LessonItem = ({
  lesson,
  isEditing,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: LessonItemProps) => {
  const [editData, setEditData] = useState<Lesson>(lesson);

  const handleSave = () => {
    onUpdate(editData);
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-purple-300 rounded-lg p-4 space-y-3">
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          placeholder="Tên bài học"
        />
        <select
          value={editData.storageType}
          onChange={(e) => setEditData({ ...editData, storageType: e.target.value as StorageType })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
        >
          <option value="CLOUDFLARE_R2">Cloudflare R2 (Auto Dubbing & HLS)</option>
          <option value="DIRECT_UPLOAD">Cloudflare R2 (Standard Upload - Bình thường)</option>
          <option value="CLOUDINARY">Cloudinary (Upload video)</option>
          <option value="YOUTUBE">YouTube</option>
          <option value="GOOGLE_DRIVE">Google Drive</option>
          <option value="OTHER">Other</option>
        </select>

        {editData.storageType === 'CLOUDFLARE_R2' || editData.storageType === 'DIRECT_UPLOAD' || editData.storageType === 'CLOUDINARY' ? (
          <VideoUpload
            value={editData.storageUrl || ''}
            onChange={(url, duration) => {
              setEditData({ ...editData, storageUrl: url, duration: duration || editData.duration });
            }}
          />
        ) : (
          <input
            type="text"
            value={editData.storageUrl || ''}
            onChange={(e) => setEditData({ ...editData, storageUrl: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            placeholder="URL video"
          />
        )}



        <textarea
          value={editData.contentText || ''}
          onChange={(e) => setEditData({ ...editData, contentText: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          rows={3}
          placeholder="Nội dung bài học (tùy chọn)"
        />

        <textarea
          value={editData.transcript || ''}
          onChange={(e) => setEditData({ ...editData, transcript: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          rows={3}
          placeholder="Bản chép lời / transcript (tùy chọn)"
        />

        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={!!editData.isPreview}
            onChange={(e) => setEditData({ ...editData, isPreview: e.target.checked })}
            className="w-4 h-4 accent-purple-600"
          />
          Cho học thử miễn phí (ai cũng xem được, kể cả chưa mua)
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUpdating ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditData(lesson);
              onCancelEdit();
            }}
            className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center gap-3">
      <GripVertical className="w-5 h-5 text-slate-400 dark:text-slate-500" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {lesson.storageType === 'CLOUDINARY' || lesson.storageType === 'YOUTUBE' ? (
            <Video className="w-4 h-4 text-blue-600" />
          ) : (
            <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          )}
          <h4 className="font-medium text-slate-800 dark:text-slate-100">{lesson.title}</h4>
          {lesson.isPreview && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Học thử</span>
          )}
        </div>
        {lesson.duration && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Thời lượng: {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Link
          to={`/instructor/lessons/${lesson.id}/quiz`}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Bài kiểm tra"
        >
          <ClipboardCheck size={16} />
        </Link>
        <button
          type="button"
          onClick={onEdit}
          disabled={isUpdating || isDeleting}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Chỉnh sửa"
        >
          <Edit2 size={16} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Xóa"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
    </div>
  );
};

interface NewLessonFormProps {
  courseId: string;
  chapterId: string;
  data: {
    title: string;
    storageType: StorageType;
    storageUrl: string;
    contentText: string;
    duration?: number;
    transcript: string;
    isPreview?: boolean;
  };
  onChange: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const NewLessonForm = ({ data, onChange, onSubmit, onCancel, isSubmitting }: NewLessonFormProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-purple-300 rounded-lg p-4 space-y-3">
      <input
        type="text"
        value={data.title}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
        placeholder="Tên bài học *"
      />
      <select
        value={data.storageType}
        onChange={(e) => onChange({ ...data, storageType: e.target.value as StorageType })}
        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
      >
        <option value="CLOUDFLARE_R2">Cloudflare R2 (Auto Dubbing & HLS)</option>
        <option value="DIRECT_UPLOAD">Cloudflare R2 (Standard Upload - Bình thường)</option>
        <option value="CLOUDINARY">Cloudinary (Upload video)</option>
        <option value="YOUTUBE">YouTube</option>
        <option value="GOOGLE_DRIVE">Google Drive</option>
        <option value="OTHER">Other</option>
      </select>

      {data.storageType === 'CLOUDFLARE_R2' || data.storageType === 'DIRECT_UPLOAD' || data.storageType === 'CLOUDINARY' ? (
        <VideoUpload
          value={data.storageUrl}
          onChange={(url, duration) => {
            onChange({ ...data, storageUrl: url, duration });
          }}
        />
      ) : (
        <input
          type="text"
          value={data.storageUrl}
          onChange={(e) => onChange({ ...data, storageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
          placeholder="URL video"
        />
      )}



      <textarea
        value={data.contentText}
        onChange={(e) => onChange({ ...data, contentText: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
        rows={3}
        placeholder="Nội dung bài học (tùy chọn)"
      />

      <textarea
        value={data.transcript}
        onChange={(e) => onChange({ ...data, transcript: e.target.value })}
        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
        rows={3}
        placeholder="Bản chép lời / transcript (tùy chọn)"
      />

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer">
        <input
          type="checkbox"
          checked={!!data.isPreview}
          onChange={(e) => onChange({ ...data, isPreview: e.target.checked })}
          className="w-4 h-4 accent-purple-600"
        />
        Cho học thử miễn phí (ai cũng xem được, kể cả chưa mua)
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!data.title.trim() || isSubmitting}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? 'Đang thêm...' : 'Thêm bài học'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default CourseContentManager;


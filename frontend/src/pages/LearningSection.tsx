import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  PlayCircle, 
  FileText, 
  MessageSquare, 
  Download,
  ThumbsUp,
  Share2,
  Flag,
  Settings,
  Maximize,
  Volume2,
  Play,
  Pause,
  ChevronDown,
  Lock,
  Edit3,
  Trash2,
  Send,
  Loader2,
  StickyNote,
  HelpCircle,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  ChevronUp
} from 'lucide-react';
import { useEnrolledCourseContents, useLessonDetail, useUpdateLessonProgress, useMyEnrollmentByCourseId } from '../hooks/useEnrollments';
import type { CourseContentSection, LessonItem } from '../api/enrollments';
import { useCommentsByLesson, useCreateComment, useUpdateComment, useDeleteComment, useToggleReaction } from '../hooks/useComments';
import type { Comment, CreateCommentBody, ReactionType } from '../api/comments';
import { useAuthStatus } from '../hooks/useAuthStatus';
import { useSubtitleTracks } from '../hooks/useSubtitleTracks';
import ReportButton from '../components/common/ReportButton';
import { useLessonNotes, useCreateLessonNote, useUpdateLessonNote, useDeleteLessonNote } from '../hooks/useLessonNotes';
import type { LessonNote } from '../api/lessonNotes';
import {
  useLessonQuestions,
  useCreateLessonQuestion,
  useCreateLessonAnswer,
  useResolveLessonQuestion,
} from '../hooks/useLessonQuestions';
import { useStudentQuiz, useSubmitQuiz, useQuizAttempts } from '../hooks/useQuizzes';
import type { QuizAttemptResult } from '../api/quizzes';
import { useMySurvey, useSubmitSurvey } from '../hooks/useCourseSurvey';

// --- VIDSTACK IMPORTS ---
import { MediaPlayer, MediaOutlet, MediaCommunitySkin, MediaPoster, useMediaStore } from '@vidstack/react';
import type { MediaPlayerElement } from 'vidstack';
import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';

// --- COMPONENTS ---

// Theo dõi tiến độ xem video và báo lên cha (throttle theo thời gian, luôn báo khi xem xong).
const VideoProgressTracker = ({
  playerRef,
  onProgress,
}: {
  playerRef: React.RefObject<MediaPlayerElement | null>;
  onProgress: (percent: number, ended: boolean) => void;
}) => {
  const { currentTime, duration, ended } = useMediaStore(playerRef);
  const lastReportedAtRef = useRef(0);
  const lastReportedEndedRef = useRef(false);

  useEffect(() => {
    if (!duration || duration <= 0) return;
    const percent = Math.min(100, Math.round((currentTime / duration) * 100));
    const now = Date.now();
    const shouldReport = (ended && !lastReportedEndedRef.current) || now - lastReportedAtRef.current > 15000;
    if (!shouldReport) return;
    lastReportedAtRef.current = now;
    lastReportedEndedRef.current = ended;
    onProgress(percent, ended);
  }, [currentTime, duration, ended, onProgress]);

  return null;
};

const VideoPlayer = ({
  lessonId,
  videoUrl,
  storageType,
  thumbnailUrl,
  onProgress,
  playerRef: externalPlayerRef,
}: {
  lessonId?: string;
  videoUrl?: string | null;
  storageType?: string;
  thumbnailUrl?: string | null;
  onProgress?: (percent: number, ended: boolean) => void;
  playerRef?: React.RefObject<MediaPlayerElement | null>;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const subtitleTracks = useSubtitleTracks(lessonId, 'enrolled');
  const internalPlayerRef = useRef<MediaPlayerElement>(null);
  const playerRef = externalPlayerRef ?? internalPlayerRef;

  const getYouTubeEmbedUrl = (url: string) => {
    return url ? `https://www.youtube.com/embed/${url}` : null;
  };

  const getGoogleDriveEmbedUrl = (url: string) => {
    if (!url) return null;

    const trimmedUrl = url.trim();
    const idOnlyPattern = /^[a-zA-Z0-9_-]{20,}$/;
    if (idOnlyPattern.test(trimmedUrl)) {
      return `https://drive.google.com/file/d/${trimmedUrl}/preview`;
    }

    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,
      /[?&]id=([a-zA-Z0-9_-]+)/,
      /\/d\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = trimmedUrl.match(pattern);
      if (match?.[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    return trimmedUrl;
  };

  const isEmbedStorage = storageType === 'YOUTUBE' || storageType === 'GOOGLE_DRIVE';

  const embedUrl = !isEmbedStorage ? null : (
    storageType === 'YOUTUBE' ? getYouTubeEmbedUrl(videoUrl || '') : getGoogleDriveEmbedUrl(videoUrl || '')
  );

  useEffect(() => {
    // Reset play state if URL changes
    setIsPlaying(false);
  }, [videoUrl]);

  return (
    <div className="relative aspect-video bg-black overflow-hidden rounded-xl shadow-2xl border border-slate-800">
      {isEmbedStorage && embedUrl ? (
        isPlaying ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full cursor-pointer" onClick={() => setIsPlaying(true)}>
            <img 
              src={thumbnailUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'} 
              alt="Video Thumbnail" 
              className="w-full h-full object-cover opacity-60"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white dark:bg-slate-900/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-transform hover:scale-110">
                 <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg">
                    <Play size={32} className="text-primary fill-primary ml-1" />
                 </div>
              </div>
            </div>
          </div>
        )
      ) : (
        videoUrl && (
          <>
            <MediaPlayer
              ref={playerRef}
              title="Video Lesson"
              src={videoUrl}
              className="w-full h-full"
              crossOrigin
              playsInline
              autoplay={true}
            >
              <MediaOutlet>
                {subtitleTracks.map((t) => (
                  <track key={t.language} kind="subtitles" src={t.src} srcLang={t.language} label={t.label} default={t.isDefault} />
                ))}
                {thumbnailUrl && (
                  <MediaPoster
                    src={thumbnailUrl}
                    alt="Video Thumbnail"
                  />
                )}
              </MediaOutlet>
              <MediaCommunitySkin />
            </MediaPlayer>
            {onProgress && <VideoProgressTracker playerRef={playerRef} onProgress={onProgress} />}
          </>
        )
      )}

      {storageType === 'GOOGLE_DRIVE' && videoUrl && (
        <div className="absolute top-3 right-3">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-md bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-white dark:bg-slate-900"
          >
            Mở trực tiếp trên Drive
          </a>
        </div>
      )}
    </div>
  );
};

const REACTION_EMOJI: Record<ReactionType, string> = { LIKE: '👍', LOVE: '❤️', HELPFUL: '💡' };
const REACTION_LABEL: Record<ReactionType, string> = { LIKE: 'Thích', LOVE: 'Yêu thích', HELPFUL: 'Hữu ích' };

const ReactionBar = ({ comment, lessonId }: { comment: Comment; lessonId: string }) => {
  const toggleReactionMutation = useToggleReaction();
  const counts = comment.reactionCounts ?? { LIKE: 0, LOVE: 0, HELPFUL: 0 };

  return (
    <div className="flex items-center gap-1 mt-1">
      {(Object.keys(REACTION_EMOJI) as ReactionType[]).map((type) => {
        const isActive = comment.myReaction === type;
        const count = counts[type];
        return (
          <button
            key={type}
            title={REACTION_LABEL[type]}
            onClick={() => toggleReactionMutation.mutate({ commentId: comment.id, type, lessonId })}
            disabled={toggleReactionMutation.isPending}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
              isActive
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{REACTION_EMOJI[type]}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
};

// Comment Item Component
const CommentItem = ({
  comment,
  lessonId,
  onReply,
  onEdit,
  onDelete,
  editingComment,
  editContent,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  formatDate,
  currentUserId,
}: {
  comment: Comment;
  lessonId: string;
  onReply: (commentId: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  editingComment: string | null;
  editContent: string;
  onEditChange: (content: string) => void;
  onSaveEdit: (commentId: string) => void;
  onCancelEdit: () => void;
  formatDate: (date: string) => string;
  currentUserId?: string;
}) => {
  const isEditing = editingComment === comment.id;
  const replies = comment.replies || [];
  const isMyComment = currentUserId === comment.userId;

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-none bg-white dark:bg-slate-900">
      <div className="flex gap-3">
        <img
          src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}&background=random`}
          alt={comment.user?.name || 'User'}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-50">{comment.user?.name || 'Người dùng'}</h4>
              <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(comment.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onReply(comment.id)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 font-medium transition-colors"
              >
                Trả lời
              </button>
              {!isMyComment && currentUserId && <ReportButton targetType="COMMENT" targetId={comment.id} />}
              {isMyComment && (
                <>
                  <button
                    onClick={() => onEdit(comment.id, comment.content)}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 font-medium transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 font-medium transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => onEditChange(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onSaveEdit(comment.id)}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700"
                >
                  Lưu
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:bg-slate-950"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed mb-1">{comment.content}</p>
              <ReactionBar comment={comment} lessonId={lessonId} />
            </>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-4 ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-4">
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <img
                    src={reply.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user?.name || 'User')}&background=random`}
                    alt={reply.user?.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-50">{reply.user?.name || 'Người dùng'}</h5>
                        <span className="text-xs text-slate-400 dark:text-slate-500">{formatDate(reply.createdAt)}</span>
                      </div>
                      {currentUserId && currentUserId !== reply.userId && (
                        <ReportButton targetType="COMMENT" targetId={reply.id} />
                      )}
                      {currentUserId === reply.userId && (
                        <div className="flex items-center gap-2">
                          {editingComment === reply.id ? (
                            <>
                              <button
                                onClick={() => onSaveEdit(reply.id)}
                                className="text-xs text-indigo-600 font-medium"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={onCancelEdit}
                                className="text-xs text-slate-500 dark:text-slate-400 font-medium"
                              >
                                Hủy
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => onEdit(reply.id, reply.content)}
                                className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={() => onDelete(reply.id)}
                                className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {editingComment === reply.id ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => onEditChange(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                        rows={2}
                      />
                    ) : (
                      <>
                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{reply.content}</p>
                        <ReactionBar comment={reply} lessonId={lessonId} />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LessonItemComponent = ({ 
  lesson, 
  isCurrent, 
  onClick 
}: { 
  lesson: LessonItem; 
  isCurrent: boolean;
  onClick: () => void;
}) => {
  return (
    <div 
      className={`flex items-center gap-3 p-3 text-sm cursor-pointer transition-colors ${
        isCurrent ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50 dark:bg-slate-950 border-l-4 border-transparent'
      } ${lesson.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={lesson.isLocked ? undefined : onClick}
    >
      
      <div className="flex-shrink-0">
         {lesson.isLocked ? (
            <Lock size={18} className="text-slate-400 dark:text-slate-500" />
         ) : (
            <PlayCircle size={18} className={`text-slate-400 dark:text-slate-500 ${isCurrent ? 'text-indigo-600' : ''}`} />
         )}
      </div>
      
      <div className="flex-1">
         <p className={`font-medium ${isCurrent ? 'text-indigo-700' : 'text-slate-700 dark:text-slate-200'}`}>{lesson.title}</p>
         <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lesson.type === 'VIDEO' && <span className="flex items-center gap-1"><PlayCircle size={10} /> Video</span>}
            {lesson.type === 'TEXT' && <span className="flex items-center gap-1"><FileText size={10} /> Bài đọc</span>}
            {lesson.type === 'QUIZ' && <span className="flex items-center gap-1"><FileText size={10} /> Quiz</span>}
            {lesson.type === 'GAME' && <span className="flex items-center gap-1"><PlayCircle size={10} /> Game</span>}
            {lesson.duration && <span>• {lesson.duration}</span>}
         </div>
      </div>
    </div>
  );
};

const CourseSidebar = ({ 
  content, 
  isOpen, 
  onClose, 
  currentLessonId,
  onLessonClick 
}: { 
  content: CourseContentSection[]; 
  isOpen: boolean; 
  onClose: () => void;
  currentLessonId?: string;
  onLessonClick: (lessonId: string) => void;
}) => {
  const [openSections, setOpenSections] = useState<string[]>(content.map(s => s.id));

  const toggleSection = (id: string) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <aside className={`fixed inset-y-0 right-0 z-40 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:translate-x-0 lg:w-96`}>
       <div className="h-16 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 tracking-tight">Nội dung khóa học</h3>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-100 dark:bg-slate-800 rounded-lg"><X size={20}/></button>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar">
          {content.map((section) => (
             <div key={section.id} className="border-b border-slate-100 dark:border-slate-800 last:border-none">
                <button 
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:bg-slate-800 transition-colors"
                >
                   <div className="text-left">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-0.5">{section.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{section.lessons.length} bài học {section.duration && `• ${section.duration}`}</p>
                   </div>
                   <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 transition-transform ${openSections.includes(section.id) ? 'rotate-180' : ''}`} />
                </button>
                
                {openSections.includes(section.id) && (
                   <div className="bg-white dark:bg-slate-900">
                      {section.lessons.map((lesson) => (
                         <LessonItemComponent 
                           key={lesson.id} 
                           lesson={lesson}
                           isCurrent={lesson.id === currentLessonId}
                           onClick={() => onLessonClick(lesson.id)}
                         />
                      ))}
                   </div>
                )}
             </div>
          ))}
       </div>
    </aside>
  );
};

// --- NOTES / Q&A / QUIZ / SURVEY PANELS ---

const formatTimestamp = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

type SeekablePlayer = { currentTime: number };

const NotesPanel = ({ lessonId, playerRef }: { lessonId: string; playerRef: React.RefObject<MediaPlayerElement | null> }) => {
  const { data: notes, isLoading } = useLessonNotes(lessonId);
  const createNoteMutation = useCreateLessonNote();
  const updateNoteMutation = useUpdateLessonNote();
  const deleteNoteMutation = useDeleteLessonNote();
  const [content, setContent] = useState('');
  const [timestampSeconds, setTimestampSeconds] = useState(0);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const captureCurrentTime = () => {
    const t = (playerRef.current as unknown as SeekablePlayer | null)?.currentTime ?? 0;
    setTimestampSeconds(Math.floor(t));
  };

  const handleSeek = (seconds: number) => {
    if (playerRef.current) {
      (playerRef.current as unknown as SeekablePlayer).currentTime = seconds;
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung ghi chú');
      return;
    }
    createNoteMutation.mutate(
      { lessonId, content: content.trim(), timestampSeconds },
      { onSuccess: () => { setContent(''); setTimestampSeconds(0); } },
    );
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editContent.trim()) return;
    updateNoteMutation.mutate({ noteId, content: editContent.trim(), lessonId }, { onSuccess: () => setEditingNoteId(null) });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ghi chú của bạn tại thời điểm này trong video..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={captureCurrentTime}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <Clock size={14} /> Tại {formatTimestamp(timestampSeconds)} (thời điểm hiện tại)
          </button>
          <button
            onClick={handleSubmit}
            disabled={createNoteMutation.isPending}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Plus size={16} /> Thêm ghi chú
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-indigo-600" /></div>
      ) : notes && notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note: LessonNote) => (
            <div key={note.id} className="flex gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <button
                onClick={() => handleSeek(note.timestampSeconds)}
                className="flex-shrink-0 h-7 px-2 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                {formatTimestamp(note.timestampSeconds)}
              </button>
              <div className="flex-1 min-w-0">
                {editingNoteId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      className="w-full px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveEdit(note.id)} className="text-xs font-bold text-indigo-600">Lưu</button>
                      <button onClick={() => setEditingNoteId(null)} className="text-xs font-bold text-slate-500 dark:text-slate-400">Hủy</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{note.content}</p>
                )}
              </div>
              {editingNoteId !== note.id && (
                <div className="flex-shrink-0 flex items-start gap-1">
                  <button
                    onClick={() => { setEditingNoteId(note.id); setEditContent(note.content); }}
                    className="p-1 text-slate-400 dark:text-slate-500 hover:text-indigo-600"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => { if (confirm('Xóa ghi chú này?')) deleteNoteMutation.mutate({ noteId: note.id, lessonId }); }}
                    className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <StickyNote size={48} className="mx-auto mb-4 text-slate-300" />
          <p>Chưa có ghi chú nào cho bài học này.</p>
        </div>
      )}
    </div>
  );
};

const QuestionsPanel = ({ lessonId }: { lessonId: string }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useLessonQuestions(lessonId, page, 10);
  const createQuestionMutation = useCreateLessonQuestion();
  const createAnswerMutation = useCreateLessonAnswer();
  const resolveMutation = useResolveLessonQuestion();
  const { user } = useAuthStatus();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  const handleAsk = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung câu hỏi');
      return;
    }
    createQuestionMutation.mutate(
      { lessonId, title: title.trim(), content: content.trim() },
      { onSuccess: () => { setTitle(''); setContent(''); setPage(1); } },
    );
  };

  const handleAnswer = (questionId: string) => {
    if (!answerText.trim()) return;
    createAnswerMutation.mutate(
      { questionId, content: answerText.trim(), lessonId },
      { onSuccess: () => { setAnsweringId(null); setAnswerText(''); } },
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề câu hỏi..."
          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Mô tả chi tiết câu hỏi của bạn..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handleAsk}
            disabled={createQuestionMutation.isPending}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Đặt câu hỏi
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-indigo-600" /></div>
      ) : data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((q) => (
            <div key={q.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">{q.title}</h4>
                    {q.isResolved && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Đã giải đáp
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{q.user?.name} • {q.answers?.length || 0} trả lời</p>
                </div>
                {user?.id && q.userId !== user.id && (
                  <ReportButton targetType="LESSON_QUESTION" targetId={q.id} />
                )}
                {!q.isResolved && q.userId === user?.id && (
                  <button
                    onClick={() => resolveMutation.mutate({ questionId: q.id, lessonId })}
                    className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 flex-shrink-0"
                  >
                    Đánh dấu đã giải đáp
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 mb-3">{q.content}</p>

              {q.answers && q.answers.length > 0 && (
                <div className="space-y-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800 mb-3">
                  {q.answers.map((a) => (
                    <div key={a.id} className="text-sm">
                      <span className={`font-semibold ${a.isInstructorAnswer ? 'text-indigo-600' : 'text-slate-800 dark:text-slate-100'}`}>
                        {a.user?.name}{' '}
                        {a.isInstructorAnswer && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full ml-1">Giảng viên</span>
                        )}
                      </span>
                      <p className="text-slate-600 dark:text-slate-300">{a.content}</p>
                      {user?.id && a.userId !== user.id && (
                        <ReportButton targetType="LESSON_ANSWER" targetId={a.id} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {answeringId === q.id ? (
                <div className="flex gap-2">
                  <input
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Nhập câu trả lời..."
                    className="flex-1 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  />
                  <button onClick={() => handleAnswer(q.id)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">Gửi</button>
                  <button onClick={() => setAnsweringId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">Hủy</button>
                </div>
              ) : (
                <button
                  onClick={() => { setAnsweringId(q.id); setAnswerText(''); }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Trả lời
                </button>
              )}
            </div>
          ))}

          {data.totalPages > page && (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="w-full py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950"
            >
              Xem thêm câu hỏi
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <HelpCircle size={48} className="mx-auto mb-4 text-slate-300" />
          <p>Chưa có câu hỏi nào. Hãy đặt câu hỏi cho giảng viên!</p>
        </div>
      )}
    </div>
  );
};

const QuizPanel = ({ lessonId }: { lessonId: string }) => {
  const { data: quiz, isLoading } = useStudentQuiz(lessonId);
  const { data: attempts } = useQuizAttempts(lessonId);
  const submitMutation = useSubmitQuiz();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-indigo-600" /></div>;
  }

  if (!quiz) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <ClipboardCheck size={48} className="mx-auto mb-4 text-slate-300" />
        <p>Bài học này chưa có bài kiểm tra.</p>
      </div>
    );
  }

  const allAnswered = quiz.questions.every((q) => answers[q.id]);

  const handleSubmit = () => {
    if (!allAnswered) {
      toast.error('Vui lòng trả lời tất cả các câu hỏi');
      return;
    }
    const payload = quiz.questions.map((q) => ({ questionId: q.id, optionId: answers[q.id] }));
    submitMutation.mutate(
      { lessonId, answers: payload },
      { onSuccess: (data) => setResult(data) },
    );
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{quiz.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Cần đạt {quiz.passingScore}% để qua bài kiểm tra</p>
        </div>
        {attempts && attempts.length > 0 && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Đã làm {attempts.length} lần • Cao nhất {Math.max(...attempts.map((a) => a.scorePercent))}%
          </span>
        )}
      </div>

      {result && (
        <div className={`rounded-xl p-5 border-2 ${result.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <div className="flex items-center gap-3">
            {result.passed ? <CheckCircle2 className="text-emerald-600" size={32} /> : <XCircle className="text-rose-600" size={32} />}
            <div>
              <p className={`font-bold text-lg ${result.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                {result.passed ? 'Chúc mừng, bạn đã đạt!' : 'Chưa đạt, hãy thử lại!'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">Điểm số: {result.scorePercent}%</p>
            </div>
          </div>
          <button
            onClick={handleRetake}
            className="mt-4 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950"
          >
            Làm lại
          </button>
        </div>
      )}

      <div className="space-y-5">
        {quiz.questions.map((q, idx) => (
          <div key={q.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-50 mb-3">{idx + 1}. {q.text}</p>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt.id;
                const isCorrectOption = !!result && result.correctOptionByQuestion[q.id] === opt.id;
                const isWrongSelected = !!result && isSelected && !isCorrectOption;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                      result
                        ? isCorrectOption
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : isWrongSelected
                          ? 'border-rose-300 bg-rose-50 text-rose-800'
                          : 'border-slate-200 dark:border-slate-800'
                        : isSelected
                        ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={isSelected}
                      disabled={!!result}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                      className="accent-indigo-600"
                    />
                    <span>{opt.text}</span>
                    {result && isCorrectOption && <CheckCircle2 size={14} className="text-emerald-600 ml-auto" />}
                    {result && isWrongSelected && <XCircle size={14} className="text-rose-600 ml-auto" />}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!result && (
        <button
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitMutation.isPending ? 'Đang chấm điểm...' : 'Nộp bài'}
        </button>
      )}
    </div>
  );
};

const SurveyCard = ({ courseId }: { courseId: string }) => {
  const { data: existingSurvey, isLoading } = useMySurvey(courseId);
  const submitMutation = useSubmitSurvey();
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [satisfactionRating, setSatisfactionRating] = useState(5);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [expanded, setExpanded] = useState(false);

  if (isLoading) return null;

  if (existingSurvey) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={24} />
        <p className="text-sm text-emerald-700 font-medium">Cảm ơn bạn đã đánh giá khóa học này!</p>
      </div>
    );
  }

  const handleSubmit = () => {
    submitMutation.mutate({
      courseId,
      body: { difficultyRating, satisfactionRating, wouldRecommend, feedback: feedback.trim() || undefined },
    });
  };

  return (
    <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900 rounded-xl p-4">
      <button onClick={() => setExpanded((v) => !v)} className="flex items-center justify-between w-full">
        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 text-left">
          🎉 Bạn đã hoàn thành khóa học! Hãy đánh giá nhé
        </span>
        {expanded ? <ChevronUp size={18} className="text-indigo-600 flex-shrink-0" /> : <ChevronDown size={18} className="text-indigo-600 flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Độ khó (1 dễ - 5 khó)</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setDifficultyRating(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold ${difficultyRating === n ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Mức độ hài lòng (1 - 5)</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setSatisfactionRating(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold ${satisfactionRating === n ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Bạn có muốn giới thiệu khóa học này không?</p>
            <button
              onClick={() => setWouldRecommend(true)}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${wouldRecommend ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              Có
            </button>
            <button
              onClick={() => setWouldRecommend(false)}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${!wouldRecommend ? 'bg-rose-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'}`}
            >
              Không
            </button>
          </div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Góp ý thêm (không bắt buộc)..."
            rows={2}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Gửi đánh giá
          </button>
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE ---

const LearningPage = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStatus();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'QNA' | 'NOTES' | 'QUESTIONS' | 'QUIZ'>('OVERVIEW');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const playerRef = useRef<MediaPlayerElement>(null);

  // Fetch course contents
  const { data: contentsData, isLoading: contentsLoading } = useEnrolledCourseContents(courseId || '');

  // Get first lesson if no lessonId provided
  const firstLessonId = contentsData?.contents[0]?.lessons[0]?.id;
  const currentLessonId = lessonId || firstLessonId;

  // Whether the current lesson is the last one in the course (used to surface the completion survey)
  const allLessonIds = contentsData?.contents.flatMap((section) => section.lessons.map((l) => l.id)) ?? [];
  const isLastLesson = allLessonIds.length > 0 && allLessonIds[allLessonIds.length - 1] === currentLessonId;

  // Fetch lesson detail
  const { data: lessonData, isLoading: lessonLoading } = useLessonDetail(
    courseId || '',
    currentLessonId || ''
  );

  const { data: quiz } = useStudentQuiz(currentLessonId || '');
  const { data: myEnrollment } = useMyEnrollmentByCourseId(courseId || '');

  // Comments
  const [commentsPage, setCommentsPage] = useState(1);
  const [allComments, setAllComments] = useState<any[]>([]);
  const { data: commentsData, isLoading: isLoadingComments } = useCommentsByLesson(
    currentLessonId || '', 
    { page: commentsPage, limit: 10, parentId: null } // Only top-level comments
  );

  // Accumulate comments when page changes
  useEffect(() => {
    if (commentsData?.data) {
      if (commentsPage === 1) {
        // Reset on first page
        setAllComments(commentsData.data.filter((c: any) => !c.parentId));
      } else {
        // Append new comments
        setAllComments(prev => {
          const newComments = commentsData.data.filter((c: any) => !c.parentId);
          const existingIds = new Set(prev.map(c => c.id));
          return [...prev, ...newComments.filter(c => !existingIds.has(c.id))];
        });
      }
    }
  }, [commentsData, commentsPage]);

  // Reset comments when lesson changes
  useEffect(() => {
    setCommentsPage(1);
    setAllComments([]);
  }, [currentLessonId]);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const updateProgressMutation = useUpdateLessonProgress();

  const handleVideoProgress = useCallback(
    (percent: number, _ended: boolean) => {
      if (!courseId || !currentLessonId) return;
      updateProgressMutation.mutate({ courseId, lessonId: currentLessonId, progressPercent: percent });
    },
    [courseId, currentLessonId, updateProgressMutation],
  );

  // Comment form state
  const [commentContent, setCommentContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleLessonClick = (lessonId: string) => {
    navigate(`/learn/course/${courseId}/lesson/${lessonId}`);
    setCommentsPage(1); // Reset comments page when switching lessons
    setAllComments([]); // Reset accumulated comments
    setReplyingTo(null);
    setEditingComment(null);
  };

  const handleSubmitComment = () => {
    if (!commentContent.trim()) {
      toast.error('Vui lòng nhập nội dung comment');
      return;
    }

    if (!currentLessonId) return;

    const body: CreateCommentBody = {
      content: commentContent.trim(),
      parentId: replyingTo || null,
    };

    createCommentMutation.mutate(
      { lessonId: currentLessonId, body },
      {
        onSuccess: () => {
          setCommentContent('');
          setReplyingTo(null);
          // Reset to page 1 to show new comment
          setCommentsPage(1);
          setAllComments([]);
        },
      }
    );
  };

  const handleUpdateComment = (commentId: string) => {
    if (!editContent.trim()) {
      toast.error('Vui lòng nhập nội dung comment');
      return;
    }

    if (!currentLessonId) return;

    updateCommentMutation.mutate(
      { lessonId: currentLessonId, commentId, body: { content: editContent.trim() } },
      {
        onSuccess: () => {
          setEditingComment(null);
          setEditContent('');
        },
      }
    );
  };

  const handleDeleteComment = (commentId: string) => {
    if (!currentLessonId) return;
    if (!confirm('Bạn có chắc muốn xóa comment này?')) return;

    deleteCommentMutation.mutate({ lessonId: currentLessonId, commentId });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (!courseId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Course ID is required</p>
      </div>
    );
  }

  if (contentsLoading || lessonLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!contentsData || !lessonData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Không tìm thấy dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-600 dark:text-slate-300 overflow-hidden">
      
      {/* 1. HEADER (Compact) */}
      {/* <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-50 flex-shrink-0">
         <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white dark:bg-slate-900/10 rounded-full transition-colors">
               <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
               <img src="/assets/image.png" alt="U Đê Mê" className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-indigo-600" />
               <div className="hidden md:block">
                  <h1 className="text-sm font-bold leading-tight">U Đê Mê Learning</h1>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Đang học tập</p>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-2">
            <div className="flex items-center mr-4 bg-white dark:bg-slate-900/10 rounded-full px-3 py-1.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
               <CheckCircle2 size={14} className="mr-1.5" /> 8% Hoàn thành
            </div>
            <button 
               className="p-2 hover:bg-white dark:bg-slate-900/10 rounded-lg lg:hidden"
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
               <Menu size={20} />
            </button>
         </div>
      </header> */}

      {/* 2. BODY */}
      <div className="flex flex-1 overflow-hidden">
         
         {/* LEFT: MAIN CONTENT */}
         <div className="flex-1 flex flex-col overflow-y-auto">
            
            {/* VIDEO AREA */}
            <div className="bg-black w-full">
               <div className="max-w-5xl mx-auto">
                  <VideoPlayer
                    key={lessonData.id}
                    lessonId={lessonData.id}
                    videoUrl={lessonData.storageUrl}
                    storageType={lessonData.storageType}
                    thumbnailUrl={contentsData.thumbnailUrl}
                    onProgress={handleVideoProgress}
                    playerRef={playerRef}
                  />
               </div>
            </div>

            {/* CONTENT TABS */}
            <div className="flex-1 bg-white dark:bg-slate-900 max-w-5xl mx-auto w-full border-x border-slate-200 dark:border-slate-800 shadow-sm min-h-[500px]">
               {/* Nav Tabs */}
               <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 sticky top-0 bg-white dark:bg-slate-900 z-10">
                  {[
                     { id: 'OVERVIEW', label: 'Tổng quan', icon: FileText },
                     { id: 'QNA', label: `Bình luận (${commentsData?.total || 0})`, icon: MessageSquare },
                     { id: 'QUESTIONS', label: 'Hỏi giảng viên', icon: HelpCircle },
                     { id: 'NOTES', label: 'Ghi chú', icon: StickyNote },
                     ...(quiz ? [{ id: 'QUIZ', label: 'Kiểm tra', icon: ClipboardCheck }] : []),
                  ].map(tab => (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
                           activeTab === tab.id 
                           ? 'border-indigo-600 text-indigo-600' 
                           : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100'
                        }`}
                     >
                        <tab.icon size={16} /> {tab.label}
                     </button>
                  ))}
               </div>

               <div className="p-6">
                  {activeTab === 'OVERVIEW' && (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                        <div>
                           <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">{lessonData.title}</h2>
                           {lessonData.description && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">{lessonData.description}</p>
                           )}
                        </div>

                        {lessonData.contentText && (
                           <div className="prose prose-sm prose-slate max-w-none text-slate-700 dark:text-slate-200">
                              <p>{lessonData.contentText}</p>
                           </div>
                        )}

                        {isLastLesson && myEnrollment?.completedAt && courseId && (
                           <SurveyCard courseId={courseId} />
                        )}

                        {/* Transcript */}
                        {lessonData.transcript && (
                           <details className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 group">
                              <summary className="px-4 py-3 cursor-pointer text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-wider flex items-center justify-between">
                                 Bản chép lời (transcript)
                                 <ChevronDown size={16} className="text-slate-400 group-open:rotate-180 transition-transform" />
                              </summary>
                              <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                 {lessonData.transcript}
                              </div>
                           </details>
                        )}

                        {/* Resources */}
                        {lessonData.resources && lessonData.resources.length > 0 && (
                           <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-3 uppercase tracking-wider">Tài liệu đính kèm</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                 {lessonData.resources.map((res, i) => (
                                    <a
                                       key={i}
                                       href={res.url}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 transition-colors cursor-pointer group"
                                    >
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center">
                                             <Download size={16} />
                                          </div>
                                          <div>
                                             <p className="text-sm font-medium text-slate-800 dark:text-slate-100 group-hover:text-indigo-700">{res.name}</p>
                                             <p className="text-xs text-slate-400 dark:text-slate-500">{res.type} {res.size && `• ${res.size}`}</p>
                                          </div>
                                       </div>
                                    </a>
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                           <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 text-sm font-medium">
                              <ThumbsUp size={18} /> Thích
                           </button>
                           <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 text-sm font-medium">
                              <Share2 size={18} /> Chia sẻ
                           </button>
                           <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 text-sm font-medium ml-auto">
                              <Flag size={18} /> Báo cáo
                           </button>
                        </div>
                     </div>
                  )}
                  {activeTab === 'NOTES' && currentLessonId && (
                     <NotesPanel lessonId={currentLessonId} playerRef={playerRef} />
                  )}

                  {activeTab === 'QUESTIONS' && currentLessonId && (
                     <QuestionsPanel lessonId={currentLessonId} />
                  )}

                  {activeTab === 'QUIZ' && currentLessonId && (
                     <QuizPanel key={currentLessonId} lessonId={currentLessonId} />
                  )}

                  {/* Comments Section */}
                  {activeTab === 'QNA' && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        {/* Comment Form */}
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                           <div className="flex gap-3">
                              <div className="flex-1">
                                 {replyingTo && (
                                    <div className="mb-2 flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg p-2">
                                       <span className="text-xs text-indigo-700 font-medium">
                                          Đang trả lời comment...
                                       </span>
                                       <button
                                          onClick={() => setReplyingTo(null)}
                                          className="text-indigo-600 hover:text-indigo-800"
                                       >
                                          <X size={14} />
                                       </button>
                                    </div>
                                 )}
                                 <textarea 
                                    placeholder={replyingTo ? "Viết phản hồi..." : "Bạn có thắc mắc gì về bài học này?"} 
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] text-sm resize-none"
                                 />
                                 <div className="flex justify-end mt-2 gap-2">
                                    {replyingTo && (
                                       <button
                                          onClick={() => setReplyingTo(null)}
                                          className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700 rounded-lg transition-colors"
                                       >
                                          Hủy
                                       </button>
                                    )}
                                    <button
                                       onClick={handleSubmitComment}
                                       disabled={createCommentMutation.isPending || !commentContent.trim()}
                                       className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                       {createCommentMutation.isPending ? (
                                          <>
                                             <Loader2 size={14} className="animate-spin" />
                                             Đang gửi...
                                          </>
                                       ) : (
                                          <>
                                             <Send size={14} />
                                             {replyingTo ? 'Gửi phản hồi' : 'Gửi comment'}
                                          </>
                                       )}
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Comments List */}
                        {isLoadingComments && commentsPage === 1 ? (
                           <div className="flex items-center justify-center py-12 bg-white dark:bg-slate-900 rounded-xl">
                              <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
                           </div>
                        ) : allComments.length > 0 || (commentsData && commentsData.data.length > 0) ? (
                           <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                              <div className="space-y-6">
                                 {allComments.length > 0 ? allComments.map((comment) => (
                                    <CommentItem
                                       key={comment.id}
                                       comment={comment}
                                       lessonId={currentLessonId || ''}
                                       onReply={(commentId) => {
                                          setReplyingTo(commentId);
                                          setEditingComment(null);
                                       }}
                                       onEdit={(commentId, content) => {
                                          setEditingComment(commentId);
                                          setEditContent(content);
                                          setReplyingTo(null);
                                       }}
                                       onDelete={handleDeleteComment}
                                       editingComment={editingComment}
                                       editContent={editContent}
                                       onEditChange={setEditContent}
                                       onSaveEdit={handleUpdateComment}
                                       onCancelEdit={() => {
                                          setEditingComment(null);
                                          setEditContent('');
                                       }}
                                       formatDate={formatDate}
                                       currentUserId={user?.id}
                                    />
                                 )) : commentsData?.data
                                    .filter((comment) => !comment.parentId)
                                    .map((comment) => (
                                       <CommentItem
                                          key={comment.id}
                                          comment={comment}
                                          lessonId={currentLessonId || ''}
                                          onReply={(commentId) => {
                                             setReplyingTo(commentId);
                                             setEditingComment(null);
                                          }}
                                          onEdit={(commentId, content) => {
                                             setEditingComment(commentId);
                                             setEditContent(content);
                                             setReplyingTo(null);
                                          }}
                                          onDelete={handleDeleteComment}
                                          editingComment={editingComment}
                                          editContent={editContent}
                                          onEditChange={setEditContent}
                                          onSaveEdit={handleUpdateComment}
                                          onCancelEdit={() => {
                                             setEditingComment(null);
                                             setEditContent('');
                                          }}
                                          formatDate={formatDate}
                                          currentUserId={user?.id}
                                       />
                                    ))}

                                 {/* Pagination */}
                                 {commentsData && commentsData.totalPages > commentsPage && (
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                       {isLoadingComments ? (
                                          <div className="flex items-center justify-center py-4">
                                             <Loader2 className="animate-spin h-5 w-5 text-indigo-600" />
                                          </div>
                                       ) : (
                                          <button
                                             onClick={() => setCommentsPage(prev => prev + 1)}
                                             className="w-full py-2.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-50 dark:bg-slate-950 transition-colors"
                                          >
                                             Xem thêm comment ({commentsData.total - allComments.length} còn lại)
                                          </button>
                                       )}
                                    </div>
                                 )}
                              </div>
                           </div>
                        ) : (
                           <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                              <MessageSquare size={48} className="mx-auto mb-4 text-slate-300" />
                              <p>Chưa có comment nào. Hãy là người đầu tiên đặt câu hỏi!</p>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>

            {/* NAV FOOTER (Mobile/Tablet) */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center lg:hidden sticky bottom-0 z-20">
               <button className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-50 dark:bg-slate-950">
                  <ChevronLeft size={16} /> Bài trước
               </button>
               <button className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white flex items-center gap-2 hover:bg-indigo-700 shadow-sm">
                  Bài tiếp theo <ChevronRight size={16} />
               </button>
            </div>
         </div>

         {/* RIGHT: CURRICULUM SIDEBAR */}
         <CourseSidebar 
            content={contentsData.contents} 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            currentLessonId={currentLessonId}
            onLessonClick={handleLessonClick}
         />

      </div>
    </div>
  );
};

export default LearningPage;
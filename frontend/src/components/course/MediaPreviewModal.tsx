import { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

type Source = {
  title: string;
  storageType?: string | null; // YOUTUBE | GOOGLE_DRIVE | CLOUDINARY | DIRECT_UPLOAD | CLOUDFLARE_R2 | OTHER
  url?: string | null;
  text?: string | null;
};

const youTubeEmbed = (raw: string) => {
  let id = raw.trim();
  if (id.includes('youtube.com/watch?v=')) id = id.split('v=')[1]?.split('&')[0] || id;
  else if (id.includes('youtu.be/')) id = id.split('youtu.be/')[1]?.split('?')[0] || id;
  else if (id.includes('youtube.com/embed/')) id = id.split('embed/')[1]?.split('?')[0] || id;
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
};

const driveEmbed = (raw: string) => {
  const m = raw.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const id = m?.[1] || (/^[a-zA-Z0-9_-]{20,}$/.test(raw.trim()) ? raw.trim() : null);
  return id ? `https://drive.google.com/file/d/${id}/preview` : raw;
};

/** Video giới thiệu của khoá: ở trang chi tiết chỉ có một đường dẫn (YouTube hoặc tệp video), không có storageType. */
export const guessStorageType = (url: string) =>
  /youtu\.?be/.test(url) || /^[a-zA-Z0-9_-]{11}$/.test(url.trim()) ? 'YOUTUBE' : 'OTHER';

interface Props {
  open: boolean;
  onClose: () => void;
  isLoading?: boolean;
  error?: string | null;
  source?: Source | null;
}

/** Cửa sổ xem thử video/bài viết (video giới thiệu khoá học và bài học thử). */
const MediaPreviewModal = ({ open, onClose, isLoading, error, source }: Props) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const type = source?.storageType || 'OTHER';
  const url = source?.url || '';
  const isYouTube = type === 'YOUTUBE';
  const isDrive = type === 'GOOGLE_DRIVE';

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={source?.title || 'Xem thử'}
      onClick={onClose}
    >
      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between text-white mb-3">
          <h3 className="font-semibold truncate pr-4">{source?.title || 'Xem thử'}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10" aria-label="Đóng">
            <X size={22} />
          </button>
        </div>

        <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="animate-spin text-white" size={36} />
          ) : error ? (
            <p className="text-slate-200 px-6 text-center">{error}</p>
          ) : url && (isYouTube || isDrive) ? (
            <iframe
              src={isYouTube ? youTubeEmbed(url) : driveEmbed(url)}
              title={source?.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : url ? (
            <video src={url} controls autoPlay className="w-full h-full" />
          ) : source?.text ? (
            <div className="w-full h-full overflow-y-auto bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 p-6 text-sm whitespace-pre-wrap">
              {source.text}
            </div>
          ) : (
            <p className="text-slate-200 px-6 text-center">Chưa có nội dung để xem thử.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewModal;

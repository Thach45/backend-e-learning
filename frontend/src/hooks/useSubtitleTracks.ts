import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { lessonResourcesApi } from '../api/lessonResources';

export type PlayerTrack = { language: string; label: string; isDefault: boolean; src: string };

/**
 * Phụ đề của bài học dưới dạng Blob URL cùng origin: <track> không gửi được header Authorization và không cần CORS.
 * Blob URL được thu hồi khi đổi bài hoặc rời trang.
 */
export function useSubtitleTracks(lessonId: string | undefined, mode: 'enrolled' | 'preview'): PlayerTrack[] {
  const { data } = useQuery({
    queryKey: ['lesson-subtitles', mode, lessonId],
    queryFn: () => lessonResourcesApi.tracks(lessonId as string, mode),
    enabled: !!lessonId,
    staleTime: 5 * 60_000,
    retry: false,
  });
  const [tracks, setTracks] = useState<PlayerTrack[]>([]);

  useEffect(() => {
    if (!data?.length) {
      setTracks([]);
      return;
    }
    const built = data.map((t) => ({
      language: t.language,
      label: t.label,
      isDefault: t.isDefault,
      src: URL.createObjectURL(new Blob([t.content], { type: 'text/vtt' })),
    }));
    setTracks(built);
    return () => built.forEach((t) => URL.revokeObjectURL(t.src));
  }, [data]);

  return tracks;
}

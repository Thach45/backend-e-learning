import apiClient from './axios';

export type LessonAttachment = { id: string; title: string; fileName: string; url: string; sizeBytes: number | null };
export type SubtitleMeta = { id: string; language: string; label: string; isDefault: boolean; updatedAt: string };
export type SubtitleTrack = { language: string; label: string; isDefault: boolean; content: string };

export const lessonResourcesApi = {
  list: async (lessonId: string): Promise<{ attachments: LessonAttachment[]; subtitles: SubtitleMeta[] }> =>
    (await apiClient.get(`/instructor/lessons/${lessonId}/resources`)).data.data,
  addAttachment: async (lessonId: string, body: { title: string; fileName: string; url: string; sizeBytes?: number }) =>
    (await apiClient.post(`/instructor/lessons/${lessonId}/attachments`, body)).data.data,
  removeAttachment: async (lessonId: string, id: string) => (await apiClient.delete(`/instructor/lessons/${lessonId}/attachments/${id}`)).data.data,
  saveSubtitle: async (lessonId: string, language: string, body: { label: string; content: string; isDefault: boolean }) =>
    (await apiClient.put(`/instructor/lessons/${lessonId}/subtitles/${language}`, body)).data.data,
  removeSubtitle: async (lessonId: string, language: string) => (await apiClient.delete(`/instructor/lessons/${lessonId}/subtitles/${language}`)).data.data,
  tracks: async (lessonId: string, mode: 'enrolled' | 'preview'): Promise<SubtitleTrack[]> =>
    (await apiClient.get(mode === 'preview' ? `/lessons/${lessonId}/preview-subtitles` : `/lessons/${lessonId}/subtitles`)).data.data,
};

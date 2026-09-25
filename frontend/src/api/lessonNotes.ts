import { apiClient } from './axios';

export type LessonNote = {
  id: string;
  userId: string;
  lessonId: string;
  content: string;
  timestampSeconds: number;
  createdAt: string;
  updatedAt: string;
};

export const lessonNotesApi = {
  getNotes: async (lessonId: string): Promise<LessonNote[]> => {
    const response = await apiClient.get(`/lessons/${lessonId}/notes`);
    return response.data.data;
  },

  createNote: async (lessonId: string, content: string, timestampSeconds: number): Promise<LessonNote> => {
    const response = await apiClient.post(`/lessons/${lessonId}/notes`, { content, timestampSeconds });
    return response.data.data;
  },

  updateNote: async (noteId: string, content: string): Promise<LessonNote> => {
    const response = await apiClient.put(`/lesson-notes/${noteId}`, { content });
    return response.data.data;
  },

  deleteNote: async (noteId: string): Promise<void> => {
    await apiClient.delete(`/lesson-notes/${noteId}`);
  },
};

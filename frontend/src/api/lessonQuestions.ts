import { apiClient } from './axios';

export type QuestionUser = {
  id: string;
  name: string;
  avatar?: string | null;
};

export type LessonAnswer = {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  isInstructorAnswer: boolean;
  createdAt: string;
  user?: QuestionUser;
};

export type LessonQuestion = {
  id: string;
  userId: string;
  lessonId: string;
  title: string;
  content: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: QuestionUser;
  answers?: LessonAnswer[];
  answerCount?: number;
};

export type GetLessonQuestionsResponse = {
  data: LessonQuestion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const lessonQuestionsApi = {
  getQuestions: async (lessonId: string, page = 1, limit = 10): Promise<GetLessonQuestionsResponse> => {
    const response = await apiClient.get(`/lessons/${lessonId}/questions`, { params: { page, limit } });
    return response.data.data;
  },

  createQuestion: async (lessonId: string, title: string, content: string): Promise<LessonQuestion> => {
    const response = await apiClient.post(`/lessons/${lessonId}/questions`, { title, content });
    return response.data.data;
  },

  createAnswer: async (questionId: string, content: string): Promise<LessonAnswer> => {
    const response = await apiClient.post(`/questions/${questionId}/answers`, { content });
    return response.data.data;
  },

  resolveQuestion: async (questionId: string): Promise<LessonQuestion> => {
    const response = await apiClient.patch(`/questions/${questionId}/resolve`);
    return response.data.data;
  },

  deleteQuestion: async (questionId: string): Promise<void> => {
    await apiClient.delete(`/questions/${questionId}`);
  },
};

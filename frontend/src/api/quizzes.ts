import { apiClient } from './axios';

export type QuizOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id: string;
  text: string;
  orderIndex: number;
  options: QuizOption[];
};

export type Quiz = {
  id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type QuizOptionPublic = { id: string; text: string };
export type QuizQuestionPublic = { id: string; text: string; orderIndex: number; options: QuizOptionPublic[] };
export type QuizPublic = {
  id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  questions: QuizQuestionPublic[];
};

export type UpsertQuizQuestionBody = {
  text: string;
  orderIndex: number;
  options: { text: string; isCorrect: boolean }[];
};

export type UpsertQuizBody = {
  title: string;
  passingScore: number;
  questions: UpsertQuizQuestionBody[];
};

export type QuizAttemptResult = {
  id: string;
  quizId: string;
  scorePercent: number;
  passed: boolean;
  submittedAt: string;
  correctOptionByQuestion: Record<string, string>;
};

export type QuizAttempt = {
  id: string;
  scorePercent: number;
  passed: boolean;
  submittedAt: string;
};

export const quizzesApi = {
  // Instructor
  getQuizForInstructor: async (lessonId: string): Promise<Quiz | null> => {
    const response = await apiClient.get(`/instructor/lessons/${lessonId}/quiz`);
    return response.data.data.quiz;
  },

  upsertQuiz: async (lessonId: string, body: UpsertQuizBody): Promise<Quiz | null> => {
    const response = await apiClient.put(`/instructor/lessons/${lessonId}/quiz`, body);
    return response.data.data.quiz;
  },

  deleteQuiz: async (lessonId: string): Promise<void> => {
    await apiClient.delete(`/instructor/lessons/${lessonId}/quiz`);
  },

  // Student
  getQuizForStudent: async (lessonId: string): Promise<QuizPublic | null> => {
    const response = await apiClient.get(`/lessons/${lessonId}/quiz`);
    return response.data.data.quiz;
  },

  submitQuiz: async (
    lessonId: string,
    answers: { questionId: string; optionId: string }[],
  ): Promise<QuizAttemptResult> => {
    const response = await apiClient.post(`/lessons/${lessonId}/quiz/submit`, { answers });
    return response.data.data;
  },

  getAttempts: async (lessonId: string): Promise<QuizAttempt[]> => {
    const response = await apiClient.get(`/lessons/${lessonId}/quiz/attempts`);
    return response.data.data;
  },
};

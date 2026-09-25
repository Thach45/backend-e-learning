import { apiClient } from './axios';

export type CourseSurveyResponse = {
  id: string;
  userId: string;
  courseId: string;
  difficultyRating: number;
  satisfactionRating: number;
  wouldRecommend: boolean;
  feedback?: string | null;
  createdAt: string;
};

export type SubmitSurveyBody = {
  difficultyRating: number;
  satisfactionRating: number;
  wouldRecommend: boolean;
  feedback?: string;
};

export type SurveyResults = {
  courseId: string;
  totalResponses: number;
  averageDifficulty: number;
  averageSatisfaction: number;
  recommendPercent: number;
  feedback: Array<{
    id: string;
    userName: string;
    difficultyRating: number;
    satisfactionRating: number;
    wouldRecommend: boolean;
    feedback?: string | null;
    createdAt: string;
  }>;
};

export const courseSurveyApi = {
  getMySurvey: async (courseId: string): Promise<CourseSurveyResponse | null> => {
    const response = await apiClient.get(`/my-enrollments/${courseId}/survey`);
    return response.data.data.survey;
  },

  submitSurvey: async (courseId: string, body: SubmitSurveyBody): Promise<CourseSurveyResponse | null> => {
    const response = await apiClient.post(`/my-enrollments/${courseId}/survey`, body);
    return response.data.data.survey;
  },

  getSurveyResults: async (courseId: string): Promise<SurveyResults> => {
    const response = await apiClient.get(`/instructor/courses/${courseId}/survey-results`);
    return response.data.data;
  },
};

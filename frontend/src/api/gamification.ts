import apiClient from './axios';

export type BadgeCode =
  | 'FIRST_COURSE_COMPLETED'
  | 'FIVE_COURSES_COMPLETED'
  | 'STREAK_7_DAYS'
  | 'STREAK_30_DAYS'
  | 'FIRST_REVIEW';

export type MyBadge = {
  code: BadgeCode;
  name: string;
  description: string;
  icon?: string | null;
  earned: boolean;
  awardedAt?: string | null;
};

export type StreakResponse = {
  currentStreak: number;
  lastActiveDate: string | null;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  avatar?: string | null;
  completedLessons: number;
};

export const gamificationApi = {
  getMyBadges: async (): Promise<{ data: MyBadge[] }> => {
    const response = await apiClient.get('/gamification/badges');
    return response.data.data;
  },

  getStreak: async (): Promise<StreakResponse> => {
    const response = await apiClient.get('/gamification/streak');
    return response.data.data;
  },

  getLeaderboard: async (): Promise<{ data: LeaderboardEntry[] }> => {
    const response = await apiClient.get('/gamification/leaderboard');
    return response.data.data;
  },
};

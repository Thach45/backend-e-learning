import apiClient from './axios';
import type { CourseCard } from './collections';

export type PublicProfileSettings = { isPublic: boolean; headline: string | null; bio: string | null; showCourses: boolean; showBadges: boolean };
export type PublicProfileView = {
  id: string; name: string; avatar: string | null; headline: string | null; bio: string | null; memberSince: string;
  stats: { enrolledCourses: number; completedCourses: number | null; badges: number | null };
  completedCourses: (CourseCard & { completedAt: string })[] | null;
  badges: { code: string; name: string; description: string; icon: string | null; awardedAt: string }[] | null;
};

export const publicProfileApi = {
  mine: async (): Promise<PublicProfileSettings> => (await apiClient.get('/profile/public')).data.data,
  save: async (b: Partial<PublicProfileSettings>): Promise<PublicProfileSettings> => (await apiClient.put('/profile/public', b)).data.data,
  view: async (userId: string): Promise<PublicProfileView> => (await apiClient.get(`/profiles/${userId}`)).data.data,
};

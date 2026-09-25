import apiClient from './axios';

export type InstructorPublicCourse = {
  id: string;
  title: string;
  thumbnail?: string | null;
  price: number;
  salePrice?: number | null;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  totalStars?: number;
  totalLearners?: number;
  reviewsCount?: number;
};

export type InstructorPublicProfile = {
  id: string;
  name: string;
  avatar?: string | null;
  title?: string | null;
  bio?: string | null;
  expertise: string[];
  yearsOfExperience?: number | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  youtubeUrl?: string | null;
  facebookUrl?: string | null;
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  followerCount: number;
  isFollowing?: boolean;
  courses: InstructorPublicCourse[];
};

export type UpdateInstructorProfileBody = {
  title?: string;
  bio?: string;
  expertise?: string[];
  yearsOfExperience?: number;
  websiteUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  youtubeUrl?: string;
  facebookUrl?: string;
};

export const instructorsApi = {
  getPublicProfile: async (id: string): Promise<InstructorPublicProfile> => {
    const response = await apiClient.get(`/instructors/${id}`);
    return response.data.data;
  },

  updateMyProfile: async (body: UpdateInstructorProfileBody) => {
    const response = await apiClient.patch('/instructor/profile', body);
    return response.data.data;
  },

  getFollowStatus: async (instructorId: string): Promise<{ following: boolean }> => {
    const response = await apiClient.get(`/instructors/${instructorId}/follow`);
    return response.data.data;
  },

  follow: async (instructorId: string): Promise<{ following: boolean; followerCount: number }> => {
    const response = await apiClient.post(`/instructors/${instructorId}/follow`);
    return response.data.data;
  },

  unfollow: async (instructorId: string): Promise<{ following: boolean; followerCount: number }> => {
    const response = await apiClient.delete(`/instructors/${instructorId}/follow`);
    return response.data.data;
  },
};

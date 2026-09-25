import apiClient from './axios';
import type { Tag } from './tags';

export type LearningGoal = 'CAREER_CHANGE' | 'UPSKILL_CURRENT_JOB' | 'SCHOOL_EXAM' | 'HOBBY' | 'START_BUSINESS' | 'OTHER';
export type Occupation = 'STUDENT' | 'EMPLOYEE' | 'FREELANCER' | 'BUSINESS_OWNER' | 'UNEMPLOYED' | 'OTHER';
export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export const GOAL_OPTIONS: { value: LearningGoal; label: string; hint: string }[] = [
  { value: 'CAREER_CHANGE', label: 'Chuyển sang nghề mới', hint: 'Học để đổi ngành, đổi vai trò' },
  { value: 'UPSKILL_CURRENT_JOB', label: 'Giỏi hơn trong công việc hiện tại', hint: 'Nâng cấp kỹ năng đang dùng' },
  { value: 'SCHOOL_EXAM', label: 'Học tập, thi cử', hint: 'Bổ trợ chương trình ở trường' },
  { value: 'START_BUSINESS', label: 'Khởi nghiệp, kinh doanh', hint: 'Xây dựng sản phẩm hoặc doanh nghiệp' },
  { value: 'HOBBY', label: 'Sở thích cá nhân', hint: 'Học cho vui, khám phá' },
  { value: 'OTHER', label: 'Mục tiêu khác', hint: '' },
];

export const OCCUPATION_OPTIONS: { value: Occupation; label: string }[] = [
  { value: 'STUDENT', label: 'Học sinh / Sinh viên' },
  { value: 'EMPLOYEE', label: 'Nhân viên' },
  { value: 'FREELANCER', label: 'Freelancer' },
  { value: 'BUSINESS_OWNER', label: 'Chủ doanh nghiệp' },
  { value: 'UNEMPLOYED', label: 'Đang tìm việc' },
  { value: 'OTHER', label: 'Khác' },
];

export const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: 'BEGINNER', label: 'Mới bắt đầu' },
  { value: 'INTERMEDIATE', label: 'Đã có nền tảng' },
  { value: 'ADVANCED', label: 'Nâng cao' },
];

export const LANGUAGE_OPTIONS = [
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'en', label: 'Tiếng Anh' },
];

export type LearningProfile = {
  goal: LearningGoal | null;
  goalNote: string | null;
  currentLevel: Level | null;
  occupation: Occupation | null;
  industry: string | null;
  yearsOfExperience: number | null;
  weeklyHours: number | null;
  preferredLanguage: string;
  allowPersonalization: boolean;
  interests: Tag[];
  onboarding: { completedAt: string | null; skippedCount: number; shouldPrompt: boolean };
};

export type UpdateLearningProfileBody = Partial<{
  goal: LearningGoal | null;
  goalNote: string | null;
  currentLevel: Level | null;
  occupation: Occupation | null;
  industry: string | null;
  yearsOfExperience: number | null;
  weeklyHours: number | null;
  preferredLanguage: string;
  allowPersonalization: boolean;
  interestTagIds: string[];
  completed: boolean;
}>;

export type RecommendedCourse = {
  id: string;
  title: string;
  thumbnail: string | null;
  price: number;
  salePrice: number | null;
  level: Level;
  language: string;
  instructor: { id: string; name: string };
  category: { id: string; name: string } | null;
  reasons: string[];
};

export const learningProfileApi = {
  get: async (): Promise<LearningProfile> => (await apiClient.get('/profile/learning')).data.data,
  update: async (body: UpdateLearningProfileBody): Promise<LearningProfile> =>
    (await apiClient.put('/profile/learning', body)).data.data,
  skip: async (): Promise<LearningProfile> => (await apiClient.post('/profile/learning/skip')).data.data,
  recommendations: async (limit = 8): Promise<{ enabled: boolean; data: RecommendedCourse[] }> =>
    (await apiClient.get('/recommendations/for-me', { params: { limit } })).data.data,
};

import { z } from "zod";

export const BadgeCodeEnum = z.enum([
  "FIRST_COURSE_COMPLETED",
  "FIVE_COURSES_COMPLETED",
  "STREAK_7_DAYS",
  "STREAK_30_DAYS",
  "FIRST_REVIEW",
]);
export type BadgeCodeValue = z.infer<typeof BadgeCodeEnum>;

export const BadgeDefinition: Record<BadgeCodeValue, { name: string; description: string; icon: string }> = {
  FIRST_COURSE_COMPLETED: {
    name: "Bước chân đầu tiên",
    description: "Hoàn thành khóa học đầu tiên của bạn",
    icon: "🎓",
  },
  FIVE_COURSES_COMPLETED: {
    name: "Ham học hỏi",
    description: "Hoàn thành 5 khóa học",
    icon: "🏆",
  },
  STREAK_7_DAYS: {
    name: "Kiên trì 7 ngày",
    description: "Học liên tục 7 ngày không nghỉ",
    icon: "🔥",
  },
  STREAK_30_DAYS: {
    name: "Bền bỉ 30 ngày",
    description: "Học liên tục 30 ngày không nghỉ",
    icon: "⚡",
  },
  FIRST_REVIEW: {
    name: "Tiếng nói đầu tiên",
    description: "Viết đánh giá đầu tiên cho một khóa học",
    icon: "⭐",
  },
};

export const MyBadgeSchema = z.object({
  code: BadgeCodeEnum,
  name: z.string(),
  description: z.string(),
  icon: z.string().nullable().optional(),
  earned: z.boolean(),
  awardedAt: z.date().nullable().optional(),
}).strict();

export const GetMyBadgesResponseSchema = z.object({
  data: z.array(MyBadgeSchema),
}).strict();

export const StreakResponseSchema = z.object({
  currentStreak: z.number(),
  lastActiveDate: z.string().nullable(),
}).strict();

export const LeaderboardEntrySchema = z.object({
  rank: z.number(),
  userId: z.string().uuid(),
  name: z.string(),
  avatar: z.string().nullable().optional(),
  completedLessons: z.number(),
}).strict();

export const GetLeaderboardResponseSchema = z.object({
  data: z.array(LeaderboardEntrySchema),
}).strict();

export type MyBadge = z.infer<typeof MyBadgeSchema>;
export type GetMyBadgesResponse = z.infer<typeof GetMyBadgesResponseSchema>;
export type StreakResponse = z.infer<typeof StreakResponseSchema>;
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
export type GetLeaderboardResponse = z.infer<typeof GetLeaderboardResponseSchema>;

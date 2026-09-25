import { z } from "zod";

export const LearningGoalEnum = z.enum(["CAREER_CHANGE", "UPSKILL_CURRENT_JOB", "SCHOOL_EXAM", "HOBBY", "START_BUSINESS", "OTHER"]);
export const OccupationEnum = z.enum(["STUDENT", "EMPLOYEE", "FREELANCER", "BUSINESS_OWNER", "UNEMPLOYED", "OTHER"]);
export const LevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

/** Số lần được bỏ qua màn hướng dẫn trước khi thôi nhắc. */
export const MAX_ONBOARDING_SKIPS = 3;
export const MAX_INTERESTS = 10;

const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);

export const UpdateLearningProfileBodySchema = z
  .object({
    goal: LearningGoalEnum.nullable().optional(),
    goalNote: z.preprocess(emptyToNull, z.string().trim().max(300).nullable()).optional(),
    currentLevel: LevelEnum.nullable().optional(),
    occupation: OccupationEnum.nullable().optional(),
    industry: z.preprocess(emptyToNull, z.string().trim().max(100).nullable()).optional(),
    yearsOfExperience: z.number().int().min(0).max(60).nullable().optional(),
    weeklyHours: z.number().int().min(0).max(168).nullable().optional(),
    preferredLanguage: z.string().trim().min(2).max(10).optional(),
    /** Đồng ý dùng hồ sơ để gợi ý khoá học. Mặc định KHÔNG. */
    allowPersonalization: z.boolean().optional(),
    interestTagIds: z.array(z.string().uuid()).max(MAX_INTERESTS).optional(),
    /** true: đánh dấu đã hoàn tất màn hướng dẫn. */
    completed: z.boolean().optional(),
  })
  .strict();

const TagLiteSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  type: z.enum(["SKILL", "TOPIC", "TOOL"]),
  categoryId: z.string().uuid().nullable(),
});

export const LearningProfileResponseSchema = z.object({
  goal: LearningGoalEnum.nullable(),
  goalNote: z.string().nullable(),
  currentLevel: LevelEnum.nullable(),
  occupation: OccupationEnum.nullable(),
  industry: z.string().nullable(),
  yearsOfExperience: z.number().nullable(),
  weeklyHours: z.number().nullable(),
  preferredLanguage: z.string(),
  allowPersonalization: z.boolean(),
  interests: z.array(TagLiteSchema),
  onboarding: z.object({
    completedAt: z.date().nullable(),
    skippedCount: z.number(),
    /** Có nên hiện màn hướng dẫn ngay bây giờ không (chưa hoàn tất và chưa bỏ qua quá số lần cho phép). */
    shouldPrompt: z.boolean(),
  }),
});

export const GetRecommendationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

export const RecommendationsResponseSchema = z.object({
  enabled: z.boolean(),
  data: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      thumbnail: z.string().nullable(),
      price: z.number(),
      salePrice: z.number().nullable(),
      level: LevelEnum,
      language: z.string(),
      instructor: z.object({ id: z.string().uuid(), name: z.string() }),
      category: z.object({ id: z.string().uuid(), name: z.string() }).nullable(),
      reasons: z.array(z.string()),
    }),
  ),
});

export type UpdateLearningProfileBody = z.infer<typeof UpdateLearningProfileBodySchema>;
export type GetRecommendationsQuery = z.infer<typeof GetRecommendationsQuerySchema>;

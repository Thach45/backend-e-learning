import { z } from "zod";

export const CourseLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);
export const CourseStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "PENDING_PUBLISHED", "PENDING_DRAFT"]);

// Base projection returned to clients
export const CourseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  price: z.number(),
  salePrice: z.number().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  introVideo: z.string().nullable().optional(),
  isFeatured: z.boolean(),
  level: CourseLevelEnum,
  status: CourseStatusEnum,
  instructorId: z.string().uuid(),
  categoryId: z.string().uuid().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  instructor: z.object({ id: z.string().uuid(), name: z.string() }).optional(),
  category: z.object({ id: z.string().uuid(), name: z.string() }).nullable().optional(),
  totalStars: z.number().optional(),
  reviewsCount: z.number().optional(),
  totalLearners: z.number().optional(),
  totalLikes: z.number().optional(),
  totalLessons: z.number().optional(),
  totalDuration: z.number().optional(), // in seconds
});

export const GetCoursesQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().trim().optional(),
  level: CourseLevelEnum.optional(),
  status: CourseStatusEnum.optional(),
  categoryId: z.string().uuid().optional(),
  instructorId: z.string().uuid().optional(),
  isFeatured: z.coerce.boolean().optional(),
}).strict();

export const GetCourseParamsSchema = z.object({
  id: z.string().uuid(),
}).strict();

export const CreateCourseBodySchema = z.object({
  title: z.string().min(1),
  price: z.number().nonnegative().default(0),
  salePrice: z.number().nonnegative().optional(),
  thumbnail: z.string().optional(),
  introVideo: z.string().optional(),
  isFeatured: z.boolean().optional(),
  level: CourseLevelEnum.default("BEGINNER"),
  status: CourseStatusEnum.default("DRAFT"),
  categoryId: z.string().uuid().optional(),
}).strict();

export const UpdateCourseBodySchema = z.object({
  title: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  introVideo: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  level: CourseLevelEnum.optional(),
  categoryId: z.string().uuid().nullable().optional(),
}).strict();

// Instructor schema for course detail
const InstructorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  rating: z.number().optional(),
  students: z.number().optional(), // total students across all courses
  courses: z.number().optional(), // total courses count
});

// Category schema
const CategorySchema = z.object({
  name: z.string(),
});

// Course detail schema
const CourseDetailSchema = z.object({
  description: z.string().nullable().optional(),
  objectives: z.string().nullable().optional(),
  benefits: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  targetAudience: z.string().nullable().optional(),
});

// Lesson schema
const LessonSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  type: z.string(), // VIDEO, TEXT, etc.
  duration: z.string().nullable().optional(), // formatted duration like "5:00"
  isFree: z.boolean().optional(),
});

// Content section schema
const ContentSectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  lessons: z.array(LessonSchema),
});

// Review schema
const ReviewSchema = z.object({
  id: z.string().uuid(),
  user: z.object({
    name: z.string(),
    avatar: z.string().nullable().optional(),
  }),
  rating: z.number(),
  comment: z.string().nullable().optional(),
  createdAt: z.string(), // formatted date
  helpful: z.number().optional(), // helpful count (can be added later)
});

// Full course response schema
export const GetCourseResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  price: z.number(),
  salePrice: z.number().nullable().optional(),
  originalPrice: z.number().optional(), // original price before sale
  thumbnail: z.string().nullable().optional(),
  introVideo: z.string().nullable().optional(),
  isFeatured: z.boolean(),
  level: CourseLevelEnum,
  status: CourseStatusEnum,
  updatedAt: z.string(), // formatted date
  instructor: InstructorSchema,
  category: CategorySchema.nullable().optional(),
  detail: CourseDetailSchema.nullable().optional(),
  content: z.array(ContentSectionSchema),
  reviews: z.array(ReviewSchema),
  totalLessons: z.number(),
  totalDuration: z.string(), // formatted like "12h 30m"
  rating: z.number(),
  reviewsCount: z.number(),
  studentsCount: z.number(),
  totalWishlist: z.number(),
});

// export const OverviewResponseSchema = z.object({
//   id: z.string().uuid(),
//   title: z.string(),
//   price: z.number(),
//   salePrice: z.number().nullable().optional(),
//   originalPrice: z.number().optional(), // original price before sale
//   thumbnail: z.string().nullable().optional(),
//   introVideo: z.string().nullable().optional(),
//   isFeatured: z.boolean(),
//   level: CourseLevelEnum,
//   status: CourseStatusEnum,
//   updatedAt: z.string(), // formatted date
//   instructor: InstructorSchema,
//   category: CategorySchema.nullable().optional(),
//   detail: CourseDetailSchema.nullable().optional(),
//   content: z.array(ContentOverviewSchema),
//   reviews: z.array(ReviewSchema),
//   totalLessons: z.number(),
//   totalDuration: z.string(), // formatted like "12h 30m"
//   rating: z.number(),
//   reviewsCount: z.number(),
//   studentsCount: z.number(),
// });
export const GetCoursesResponseSchema = z.object({
  data: z.array(CourseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
}).strict();

// Summary response used by create/update/delete instructor/admin actions
export const GetCourseSummaryResponseSchema = CourseSchema;

export type Course = z.infer<typeof CourseSchema>;
export type GetCoursesQuery = z.infer<typeof GetCoursesQuerySchema>;
export type GetCourseParams = z.infer<typeof GetCourseParamsSchema>;
export type CreateCourseBody = z.infer<typeof CreateCourseBodySchema>;
export type UpdateCourseBody = z.infer<typeof UpdateCourseBodySchema>;
export type GetCourseResponse = z.infer<typeof GetCourseResponseSchema>;
export type GetCoursesResponse = z.infer<typeof GetCoursesResponseSchema>;
export type GetCourseSummaryResponse = z.infer<typeof GetCourseSummaryResponseSchema>;



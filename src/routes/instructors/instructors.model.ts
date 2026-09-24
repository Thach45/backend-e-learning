import { z } from "zod";

export const InstructorCourseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  thumbnail: z.string().nullable().optional(),
  price: z.number(),
  salePrice: z.number().nullable().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  totalStars: z.number().optional(),
  totalLearners: z.number().optional(),
  reviewsCount: z.number().optional(),
});

export const PublicInstructorProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatar: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  expertise: z.array(z.string()),
  yearsOfExperience: z.number().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  youtubeUrl: z.string().nullable().optional(),
  facebookUrl: z.string().nullable().optional(),
  totalCourses: z.number(),
  totalStudents: z.number(),
  averageRating: z.number(),
  followerCount: z.number(),
  isFollowing: z.boolean().optional(),
  courses: z.array(InstructorCourseSchema),
}).strict();

export type PublicInstructorProfile = z.infer<typeof PublicInstructorProfileSchema>;

export const GetInstructorParamsSchema = z.object({
  id: z.string().uuid(),
}).strict();

export type GetInstructorParams = z.infer<typeof GetInstructorParamsSchema>;

export const GetInstructorResponseSchema = PublicInstructorProfileSchema;
export type GetInstructorResponse = z.infer<typeof GetInstructorResponseSchema>;

export const FollowInstructorResponseSchema = z.object({
  following: z.boolean(),
  followerCount: z.number(),
}).strict();
export type FollowInstructorResponse = z.infer<typeof FollowInstructorResponseSchema>;

export const FollowStatusResponseSchema = z.object({
  following: z.boolean(),
}).strict();
export type FollowStatusResponse = z.infer<typeof FollowStatusResponseSchema>;

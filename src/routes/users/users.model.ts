import { z } from "zod";

// Base user as exposed via API (exclude sensitive fields)
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  phoneNumber: z.string(),
  avatar: z.string().nullable().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]),
  createdAt: z.date(),
  updatedAt: z.date(),
  roles: z.array(z.string()),
});

// Query/Params
export const GetUsersQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  search: z.string().trim().optional(),
}).strict();

export const GetUserParamsSchema = z.object({
  id: z.string().uuid(),
}).strict();

// Body schemas
export const CreateUserBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phoneNumber: z.string().min(3),
  avatar: z.string().optional(),
}).strict();

export const UpdateUserBodySchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  name: z.string().min(1).optional(),
  phoneNumber: z.string().min(3).optional(),
  avatar: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
  roles: z.array(z.enum(["ADMIN", "INSTRUCTOR", "CLIENT"])).optional(),
}).strict();

export const UpdateUserStatusBodySchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]),
}).strict();

// Response schemas
export const GetUserResponseSchema = UserSchema;

export const GetUsersResponseSchema = z.object({
  data: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
}).strict();

export type User = z.infer<typeof UserSchema>;
export type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
export type UpdateUserStatusBody = z.infer<typeof UpdateUserStatusBodySchema>;
export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>;
export type GetUserParams = z.infer<typeof GetUserParamsSchema>;
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;
export type GetUsersResponse = z.infer<typeof GetUsersResponseSchema>;



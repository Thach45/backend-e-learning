
import { METHODS } from "src/shared/constants/permission.constants";
import { z } from "zod";

export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  path: z.string(),
  method: z.nativeEnum(METHODS),
  createdById: z.string().optional(),
  updatedById: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export const GetPermissionResponseSchema = z.object({
    data: z.array(PermissionSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
})
export const GetPermissionDetailResponseSchema = PermissionSchema
export const GetPermissionQuerySchema = z.object({
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(10),
}).strict()
export const GetPermissionParamsSchema = z.object({
    id: z.string(),
}).strict()
export const CreatePermissionSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    path: z.string(),
    method: z.nativeEnum(METHODS),
}).strict()

export const UpdatePermissionSchema = CreatePermissionSchema
export type UpdatePermissionType = z.infer<typeof UpdatePermissionSchema>
export type CreatePermissionType = z.infer<typeof CreatePermissionSchema>
export type GetPermissionQueryType = z.infer<typeof GetPermissionQuerySchema>
export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>
export type GetPermissionResponseType = z.infer<typeof GetPermissionResponseSchema>
export type GetPermissionDetailResponseType = z.infer<typeof GetPermissionDetailResponseSchema>

export type PermissionType = z.infer<typeof PermissionSchema>
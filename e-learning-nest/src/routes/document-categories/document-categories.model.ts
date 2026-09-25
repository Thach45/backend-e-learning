import { z } from 'zod';

// Base DocumentCategory schema
export const DocumentCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
  // Include document count for listing
  _count: z.object({
    documents: z.number(),
  }).optional(),
});

export type DocumentCategory = z.infer<typeof DocumentCategorySchema>;

// Query params for listing
export const GetDocumentCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
}).strict();

export type GetDocumentCategoriesQuery = z.infer<typeof GetDocumentCategoriesQuerySchema>;

// Params for get by ID
export const GetDocumentCategoryParamsSchema = z.object({
  id: z.string().uuid(),
}).strict();

export type GetDocumentCategoryParams = z.infer<typeof GetDocumentCategoryParamsSchema>;

// Create body
export const CreateDocumentCategoryBodySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  slug: z.string().max(100).optional(),
  icon: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
}).strict();

export type CreateDocumentCategoryBody = z.infer<typeof CreateDocumentCategoryBodySchema>;

// Update body
export const UpdateDocumentCategoryBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  slug: z.string().max(100).optional(),
  icon: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
}).strict();

export type UpdateDocumentCategoryBody = z.infer<typeof UpdateDocumentCategoryBodySchema>;

// Response schemas
export const DocumentCategoryResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  isActive: z.boolean(),
  documentCount: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DocumentCategoryResponse = z.infer<typeof DocumentCategoryResponseSchema>;

export const GetDocumentCategoriesResponseSchema = z.object({
  data: z.array(DocumentCategoryResponseSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type GetDocumentCategoriesResponse = z.infer<typeof GetDocumentCategoriesResponseSchema>;

export const GetDocumentCategoryResponseSchema = DocumentCategoryResponseSchema;

export type GetDocumentCategoryResponse = z.infer<typeof GetDocumentCategoryResponseSchema>;


import { z } from 'zod';

// Base DocumentTag schema
export const DocumentTagSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Include document count for listing
  _count: z.object({
    materials: z.number(),
  }).optional(),
});

export type DocumentTag = z.infer<typeof DocumentTagSchema>;

// Query params for listing
export const GetDocumentTagsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
}).strict();

export type GetDocumentTagsQuery = z.infer<typeof GetDocumentTagsQuerySchema>;

// Params for get by ID
export const GetDocumentTagParamsSchema = z.object({
  id: z.string().uuid(),
}).strict();

export type GetDocumentTagParams = z.infer<typeof GetDocumentTagParamsSchema>;

// Create body
export const CreateDocumentTagBodySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().max(50).optional(),
  description: z.string().max(200).optional(),
  color: z.string().max(20).optional(), // hex color
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
}).strict();

export type CreateDocumentTagBody = z.infer<typeof CreateDocumentTagBodySchema>;

// Update body
export const UpdateDocumentTagBodySchema = z.object({
  name: z.string().min(1).max(50).optional(),
  slug: z.string().max(50).optional(),
  description: z.string().max(200).optional(),
  color: z.string().max(20).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
}).strict();

export type UpdateDocumentTagBody = z.infer<typeof UpdateDocumentTagBodySchema>;

// Response schemas
export const DocumentTagResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  isActive: z.boolean(),
  sortOrder: z.number(),
  documentCount: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DocumentTagResponse = z.infer<typeof DocumentTagResponseSchema>;

export const GetDocumentTagsResponseSchema = z.object({
  data: z.array(DocumentTagResponseSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type GetDocumentTagsResponse = z.infer<typeof GetDocumentTagsResponseSchema>;

export const GetDocumentTagResponseSchema = DocumentTagResponseSchema;

export type GetDocumentTagResponse = z.infer<typeof GetDocumentTagResponseSchema>;

// Trending tags response
export const GetTrendingTagsResponseSchema = z.object({
  data: z.array(DocumentTagResponseSchema),
});

export type GetTrendingTagsResponse = z.infer<typeof GetTrendingTagsResponseSchema>;


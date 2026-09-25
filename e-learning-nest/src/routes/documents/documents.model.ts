import { z } from 'zod';

// Enum for material type
export const MaterialTypeEnum = z.enum(['PDF', 'DOC', 'PPT', 'ZIP', 'LINK', 'OTHER']);
export type MaterialType = z.infer<typeof MaterialTypeEnum>;

// Sort options
export const DocumentSortEnum = z.enum(['newest', 'trending', 'most_viewed', 'most_downloaded', 'most_liked']);
export type DocumentSort = z.infer<typeof DocumentSortEnum>;

// Base Document schema (combined SupplementaryMaterial + MaterialDetail)
export const DocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  type: MaterialTypeEnum,
  url: z.string(),
  uploadedAt: z.date(),
  // Uploader info
  uploader: z.object({
    id: z.string().uuid(),
    name: z.string(),
    avatar: z.string().nullable().optional(),
  }).nullable().optional(),
  // Category info
  category: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }).nullable().optional(),
  // From MaterialDetail
  university: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  pages: z.number().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  isVerified: z.boolean(),
  views: z.number(),
  downloads: z.number(),
  likes: z.number(),
  // Tags from DocumentTag relation
  tags: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    color: z.string().nullable().optional(),
  })),
  // For authenticated users
  isLiked: z.boolean().optional(),
});

export type Document = z.infer<typeof DocumentSchema>;

// Query params for listing documents
export const GetDocumentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  categoryId: z.string().uuid().optional(),
  university: z.string().optional(),
  subject: z.string().optional(),
  type: MaterialTypeEnum.optional(),
  sort: DocumentSortEnum.default('newest'),
  search: z.string().optional(),
  uploaderId: z.string().uuid().optional(),
}).strict();

export type GetDocumentsQuery = z.infer<typeof GetDocumentsQuerySchema>;

// Params for get by ID
export const GetDocumentParamsSchema = z.object({
  id: z.string().uuid(),
}).strict();

export type GetDocumentParams = z.infer<typeof GetDocumentParamsSchema>;

// Create document body
export const CreateDocumentBodySchema = z.object({
  title: z.string().min(1).max(255),
  type: MaterialTypeEnum,
  url: z.string().url(),
  categoryId: z.string().uuid().optional(),
  // MaterialDetail fields
  university: z.string().max(200).optional(),
  subject: z.string().max(100).optional(),
  pages: z.number().int().positive().optional(),
  thumbnail: z.string().url().optional(),
  tagIds: z.array(z.string().uuid()).max(10).default([]),
}).strict();

export type CreateDocumentBody = z.infer<typeof CreateDocumentBodySchema>;

// Update document body
export const UpdateDocumentBodySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  categoryId: z.string().uuid().optional(),
  university: z.string().max(200).optional(),
  subject: z.string().max(100).optional(),
  pages: z.number().int().positive().optional(),
  thumbnail: z.string().url().optional(),
  tagIds: z.array(z.string().uuid()).max(10).optional(),
}).strict();

export type UpdateDocumentBody = z.infer<typeof UpdateDocumentBodySchema>;

// Toggle verify body (admin)
export const ToggleVerifyBodySchema = z.object({
  isVerified: z.boolean(),
}).strict();

export type ToggleVerifyBody = z.infer<typeof ToggleVerifyBodySchema>;

// Response schemas
export const DocumentResponseSchema = DocumentSchema;
export type DocumentResponse = z.infer<typeof DocumentResponseSchema>;

export const GetDocumentsResponseSchema = z.object({
  data: z.array(DocumentSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type GetDocumentsResponse = z.infer<typeof GetDocumentsResponseSchema>;

export const GetDocumentResponseSchema = DocumentSchema;
export type GetDocumentResponse = z.infer<typeof GetDocumentResponseSchema>;

// Top contributor schema
export const TopContributorSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatar: z.string().nullable().optional(),
  uploads: z.number(),
  university: z.string().nullable().optional(),
});

export type TopContributor = z.infer<typeof TopContributorSchema>;

export const GetTopContributorsResponseSchema = z.object({
  data: z.array(TopContributorSchema),
});

export type GetTopContributorsResponse = z.infer<typeof GetTopContributorsResponseSchema>;

// Like response
export const LikeResponseSchema = z.object({
  liked: z.boolean(),
  totalLikes: z.number(),
});

export type LikeResponse = z.infer<typeof LikeResponseSchema>;

// Download response
export const DownloadResponseSchema = z.object({
  url: z.string(),
  totalDownloads: z.number(),
});

export type DownloadResponse = z.infer<typeof DownloadResponseSchema>;


import z from "zod";

// Prisma Category fields
// id, name, imageUrl?, parentId?, createdAt, updatedAt, deletedAt?, createdBy?, updatedBy?, isActive
export const CategorySchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    imageUrl: z.string().nullable().optional(),
    parentId: z.string().uuid().nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable().optional(),
    createdBy: z.string().nullable().optional(),
    updatedBy: z.string().nullable().optional(),
    isActive: z.boolean(),
});

export const CreateCategoryBodySchema = z.object({
    name: z.string().min(1),
    imageUrl: z.string().optional(),
    parentId: z.string().uuid().optional(),
    isActive: z.boolean().optional(),
});

export const UpdateCategoryBodySchema = z.object({
    name: z.string().min(1).optional(),
    imageUrl: z.string().optional(),
    parentId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().optional(),
});

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategoryBody = z.infer<typeof CreateCategoryBodySchema>;
export type UpdateCategoryBody = z.infer<typeof UpdateCategoryBodySchema>;

// Response Schemas
export const CategoryResponseSchema = CategorySchema;

export const GetListCategoriesResponseSchema = z.array(CategoryResponseSchema);

export const DeleteCategoryResponseSchema = z.object({
    success: z.boolean(),
});

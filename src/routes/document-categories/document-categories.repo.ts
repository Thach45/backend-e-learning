import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/service/prisma.service';
import {
  GetDocumentCategoriesQuery,
  CreateDocumentCategoryBody,
  UpdateDocumentCategoryBody,
} from './document-categories.model';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories(query: GetDocumentCategoriesQuery) {
    const { page, limit, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.DocumentCategoryWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined ? { isActive } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    const [categories, totalItems] = await Promise.all([
      this.prisma.documentCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { documents: true },
          },
        },
      }),
      this.prisma.documentCategory.count({ where }),
    ]);

    return {
      data: categories.map(cat => ({
        ...cat,
        documentCount: cat._count.documents,
      })),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async getCategoryById(id: string) {
    const category = await this.prisma.documentCategory.findUnique({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Document category with ID ${id} not found`);
    }

    return {
      ...category,
      documentCount: category._count.documents,
    };
  }

  async createCategory(body: CreateDocumentCategoryBody) {
    // Generate slug from name if not provided
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const category = await this.prisma.documentCategory.create({
      data: {
        name: body.name,
        description: body.description,
        slug,
        icon: body.icon,
        isActive: body.isActive ?? true,
      },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    return {
      ...category,
      documentCount: category._count.documents,
    };
  }

  async updateCategory(id: string, body: UpdateDocumentCategoryBody) {
    // Check if exists
    await this.getCategoryById(id);

    const updateData: Prisma.DocumentCategoryUpdateInput = {};
    if (body.name !== undefined) {
      updateData.name = body.name;
      // Update slug if name changes and no explicit slug provided
      if (!body.slug) {
        updateData.slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
    }
    if (body.description !== undefined) updateData.description = body.description;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const category = await this.prisma.documentCategory.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    return {
      ...category,
      documentCount: category._count.documents,
    };
  }

  async deleteCategory(id: string) {
    // Check if exists
    await this.getCategoryById(id);

    // Soft delete
    await this.prisma.documentCategory.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return { message: 'Category deleted successfully' };
  }
}


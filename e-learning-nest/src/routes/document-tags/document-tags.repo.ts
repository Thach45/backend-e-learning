import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/service/prisma.service';
import type { 
  GetDocumentTagsQuery, 
  CreateDocumentTagBody, 
  UpdateDocumentTagBody,
  DocumentTagResponse,
  GetDocumentTagsResponse,
} from './document-tags.model';

@Injectable()
export class DocumentTagsRepo {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(tag: any): DocumentTagResponse {
    return {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      color: tag.color,
      isActive: tag.isActive,
      sortOrder: tag.sortOrder,
      documentCount: tag._count?.materials || 0,
      createdAt: tag.createdAt,
      updatedAt: tag.updatedAt,
    };
  }

  async findAll(query: GetDocumentTagsQuery): Promise<GetDocumentTagsResponse> {
    const { page, limit, isActive, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [tags, totalItems] = await Promise.all([
      this.prisma.documentTag.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          _count: {
            select: { materials: true },
          },
        },
      }),
      this.prisma.documentTag.count({ where }),
    ]);

    return {
      data: tags.map(tag => this.toResponse(tag)),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findTrending(limit = 10): Promise<DocumentTagResponse[]> {
    const tags = await this.prisma.documentTag.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { materials: true },
        },
      },
      orderBy: {
        materials: { _count: 'desc' },
      },
      take: limit,
    });

    return tags.map(tag => this.toResponse(tag));
  }

  async findById(id: string): Promise<DocumentTagResponse | null> {
    const tag = await this.prisma.documentTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { materials: true },
        },
      },
    });

    return tag ? this.toResponse(tag) : null;
  }

  async findBySlug(slug: string): Promise<DocumentTagResponse | null> {
    const tag = await this.prisma.documentTag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { materials: true },
        },
      },
    });

    return tag ? this.toResponse(tag) : null;
  }

  async create(body: CreateDocumentTagBody): Promise<DocumentTagResponse> {
    // Auto-generate slug if not provided
    const slug = body.slug || this.generateSlug(body.name);
    
    const tag = await this.prisma.documentTag.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        color: body.color,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
      include: {
        _count: {
          select: { materials: true },
        },
      },
    });

    return this.toResponse(tag);
  }

  async update(id: string, body: UpdateDocumentTagBody): Promise<DocumentTagResponse> {
    const tag = await this.prisma.documentTag.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.slug && { slug: body.slug }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      },
      include: {
        _count: {
          select: { materials: true },
        },
      },
    });

    return this.toResponse(tag);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.documentTag.delete({ where: { id } });
  }

  async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
    const tag = await this.prisma.documentTag.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return !!tag;
  }

  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    const tag = await this.prisma.documentTag.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return !!tag;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}


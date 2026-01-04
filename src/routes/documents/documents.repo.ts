import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/shared/service/prisma.service';
import {
  GetDocumentsQuery,
  CreateDocumentBody,
  UpdateDocumentBody,
  DocumentSort,
} from './documents.model';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Helper to transform database result to document response
  private transformDocument(doc: any, userId?: string) {
    const detail = doc.materialDetail;
    // Transform tags from junction table
    const tags = detail?.documentTags?.map((dt: any) => ({
      id: dt.documentTag.id,
      name: dt.documentTag.name,
      slug: dt.documentTag.slug,
      color: dt.documentTag.color,
    })) || [];
    
    return {
      id: doc.id,
      title: doc.title,
      type: doc.materialType,
      url: doc.url,
      uploadedAt: doc.uploadedAt,
      uploader: doc.uploader ? {
        id: doc.uploader.id,
        name: doc.uploader.name,
        avatar: doc.uploader.avatar,
      } : null,
      category: doc.category ? {
        id: doc.category.id,
        name: doc.category.name,
      } : null,
      university: detail?.schoolName || null,
      subject: detail?.subject || null,
      pages: detail?.pages || null,
      thumbnail: detail?.thumbnail || null,
      isVerified: detail?.isVerified || false,
      views: detail?.totalView || 0,
      downloads: detail?.totalDownload || 0,
      likes: detail?.totalLike || 0,
      tags,
      isLiked: userId ? doc.likes?.some((like: any) => like.userId === userId) : undefined,
    };
  }

  // Get sort order based on sort option
  private getSortOrder(sort: DocumentSort): Prisma.SupplementaryMaterialOrderByWithRelationInput {
    switch (sort) {
      case 'newest':
        return { uploadedAt: 'desc' };
      case 'trending':
        // Trending = combination of recent views and likes
        return { materialDetail: { totalView: 'desc' } };
      case 'most_viewed':
        return { materialDetail: { totalView: 'desc' } };
      case 'most_downloaded':
        return { materialDetail: { totalDownload: 'desc' } };
      case 'most_liked':
        return { materialDetail: { totalLike: 'desc' } };
      default:
        return { uploadedAt: 'desc' };
    }
  }

  // Get documents with filters and pagination
  async getDocuments(query: GetDocumentsQuery, userId?: string) {
    const { page, limit, categoryId, university, subject, type, sort, search, uploaderId } = query;
    const skip = (page - 1) * limit;

    // Build where clause - only get community documents (not course/lesson materials)
    const where: Prisma.SupplementaryMaterialWhereInput = {
      // Community documents have uploaderId set and no lessonId/courseId
      uploaderId: uploaderId ? uploaderId : { not: null },
      lessonId: null,
      courseId: null,
      ...(categoryId ? { categoryId } : {}),
      ...(type ? { materialType: type } : {}),
      ...(university || subject || search ? {
        materialDetail: {
          isActive: true,
          ...(university ? { schoolName: { contains: university, mode: 'insensitive' } } : {}),
          ...(subject ? { subject: { contains: subject, mode: 'insensitive' } } : {}),
        },
      } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { materialDetail: { subject: { contains: search, mode: 'insensitive' } } },
          { materialDetail: { documentTags: { some: { documentTag: { name: { contains: search, mode: 'insensitive' } } } } } },
        ],
      } : {}),
    };

    const include = {
      uploader: {
        select: { id: true, name: true, avatar: true },
      },
      category: {
        select: { id: true, name: true },
      },
      materialDetail: {
        include: {
          documentTags: {
            include: {
              documentTag: {
                select: { id: true, name: true, slug: true, color: true },
              },
            },
          },
        },
      },
      ...(userId ? {
        likes: {
          where: { userId },
          select: { userId: true },
        },
      } : {}),
    };

    const [documents, totalItems] = await Promise.all([
      this.prisma.supplementaryMaterial.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.getSortOrder(sort),
        include,
      }),
      this.prisma.supplementaryMaterial.count({ where }),
    ]);

    return {
      data: documents.map(doc => this.transformDocument(doc, userId)),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  // Get single document by ID
  async getDocumentById(id: string, userId?: string, incrementView = false) {
    const include = {
      uploader: {
        select: { id: true, name: true, avatar: true },
      },
      category: {
        select: { id: true, name: true },
      },
      materialDetail: {
        include: {
          documentTags: {
            include: {
              documentTag: {
                select: { id: true, name: true, slug: true, color: true },
              },
            },
          },
        },
      },
      ...(userId ? {
        likes: {
          where: { userId },
          select: { userId: true },
        },
      } : {}),
    };

    const document = await this.prisma.supplementaryMaterial.findUnique({
      where: { id },
      include,
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Increment view count if requested
    if (incrementView && document.materialDetail) {
      await this.prisma.materialDetail.update({
        where: { id: document.materialDetail.id },
        data: { totalView: { increment: 1 } },
      });

      // Track view
      if (userId) {
        await this.prisma.userDocumentView.create({
          data: { userId, materialId: id },
        }).catch(() => {}); // Ignore if already exists
      }
    }

    return this.transformDocument(document, userId);
  }

  // Get trending documents
  async getTrendingDocuments(limit = 10, userId?: string) {
    const documents = await this.prisma.supplementaryMaterial.findMany({
      where: {
        uploaderId: { not: null },
        lessonId: null,
        courseId: null,
        materialDetail: { isActive: true },
      },
      take: limit,
      orderBy: [
        { materialDetail: { totalView: 'desc' } },
        { materialDetail: { totalLike: 'desc' } },
      ],
      include: {
        uploader: {
          select: { id: true, name: true, avatar: true },
        },
        category: {
          select: { id: true, name: true },
        },
        materialDetail: {
          include: {
            documentTags: {
              include: {
                documentTag: {
                  select: { id: true, name: true, slug: true, color: true },
                },
              },
            },
          },
        },
        ...(userId ? {
          likes: {
            where: { userId },
            select: { userId: true },
          },
        } : {}),
      },
    });

    return {
      data: documents.map(doc => this.transformDocument(doc, userId)),
    };
  }

  // Get top contributors
  async getTopContributors(limit = 10) {
    const contributors = await this.prisma.user.findMany({
      where: {
        uploadedMaterials: {
          some: {
            lessonId: null,
            courseId: null,
          },
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        _count: {
          select: {
            uploadedMaterials: {
              where: {
                lessonId: null,
                courseId: null,
              },
            },
          },
        },
      },
      orderBy: {
        uploadedMaterials: { _count: 'desc' },
      },
      take: limit,
    });

    // Get the most common university for each contributor
    const result = await Promise.all(
      contributors.map(async (user) => {
        const topUniversity = await this.prisma.materialDetail.groupBy({
          by: ['schoolName'],
          where: {
            material: {
              uploaderId: user.id,
              lessonId: null,
              courseId: null,
            },
            schoolName: { not: null },
          },
          _count: { schoolName: true },
          orderBy: { _count: { schoolName: 'desc' } },
          take: 1,
        });

        return {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          uploads: user._count.uploadedMaterials,
          university: topUniversity[0]?.schoolName || null,
        };
      })
    );

    return { data: result };
  }

  // Create document
  async createDocument(body: CreateDocumentBody, userId: string) {
    const tagIds = body.tagIds || [];
    
    const document = await this.prisma.supplementaryMaterial.create({
      data: {
        title: body.title,
        materialType: body.type,
        url: body.url,
        uploaderId: userId,
        categoryId: body.categoryId,
        materialDetail: {
          create: {
            schoolName: body.university,
            subject: body.subject,
            pages: body.pages,
            thumbnail: body.thumbnail,
            createdBy: userId,
            // Create tag relations
            documentTags: tagIds.length > 0 ? {
              create: tagIds.map(tagId => ({
                documentTag: { connect: { id: tagId } },
              })),
            } : undefined,
          },
        },
      },
      include: {
        uploader: {
          select: { id: true, name: true, avatar: true },
        },
        category: {
          select: { id: true, name: true },
        },
        materialDetail: {
          include: {
            documentTags: {
              include: {
                documentTag: {
                  select: { id: true, name: true, slug: true, color: true },
                },
              },
            },
          },
        },
      },
    });

    return this.transformDocument(document, userId);
  }

  // Update document (owner only)
  async updateDocument(id: string, body: UpdateDocumentBody, userId: string) {
    const document = await this.prisma.supplementaryMaterial.findUnique({
      where: { id },
      select: { uploaderId: true, materialDetail: { select: { id: true } } },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (document.uploaderId !== userId) {
      throw new ForbiddenException('You can only update your own documents');
    }

    // Update material
    const updateData: Prisma.SupplementaryMaterialUpdateInput = {};
    if (body.title) updateData.title = body.title;
    if (body.categoryId) updateData.category = { connect: { id: body.categoryId } };

    // Update detail
    const detailUpdateData: Prisma.MaterialDetailUpdateInput = {};
    if (body.university !== undefined) detailUpdateData.schoolName = body.university;
    if (body.subject !== undefined) detailUpdateData.subject = body.subject;
    if (body.pages !== undefined) detailUpdateData.pages = body.pages;
    if (body.thumbnail !== undefined) detailUpdateData.thumbnail = body.thumbnail;

    // Handle tags update if provided
    if (body.tagIds !== undefined && document.materialDetail) {
      // Delete existing tag relations and create new ones
      await this.prisma.documentTagOnMaterial.deleteMany({
        where: { materialDetailId: document.materialDetail.id },
      });
      
      if (body.tagIds.length > 0) {
        await this.prisma.documentTagOnMaterial.createMany({
          data: body.tagIds.map(tagId => ({
            materialDetailId: document.materialDetail!.id,
            documentTagId: tagId,
          })),
        });
      }
    }

    if (Object.keys(detailUpdateData).length > 0 && document.materialDetail) {
      updateData.materialDetail = {
        update: detailUpdateData,
      };
    }

    const updated = await this.prisma.supplementaryMaterial.update({
      where: { id },
      data: updateData,
      include: {
        uploader: {
          select: { id: true, name: true, avatar: true },
        },
        category: {
          select: { id: true, name: true },
        },
        materialDetail: {
          include: {
            documentTags: {
              include: {
                documentTag: {
                  select: { id: true, name: true, slug: true, color: true },
                },
              },
            },
          },
        },
      },
    });

    return this.transformDocument(updated, userId);
  }

  // Delete document (owner only)
  async deleteDocument(id: string, userId: string) {
    const document = await this.prisma.supplementaryMaterial.findUnique({
      where: { id },
      select: { uploaderId: true },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (document.uploaderId !== userId) {
      throw new ForbiddenException('You can only delete your own documents');
    }

    // Delete related records first
    await this.prisma.$transaction([
      this.prisma.userDocumentLike.deleteMany({ where: { materialId: id } }),
      this.prisma.userDocumentDownload.deleteMany({ where: { materialId: id } }),
      this.prisma.userDocumentView.deleteMany({ where: { materialId: id } }),
      this.prisma.materialDetail.deleteMany({ where: { materialId: id } }),
      this.prisma.supplementaryMaterial.delete({ where: { id } }),
    ]);

    return { message: 'Document deleted successfully' };
  }

  // Toggle like
  async toggleLike(documentId: string, userId: string) {
    const document = await this.prisma.supplementaryMaterial.findUnique({
      where: { id: documentId },
      include: { materialDetail: true },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const existing = await this.prisma.userDocumentLike.findUnique({
      where: { userId_materialId: { userId, materialId: documentId } },
    });

    if (existing) {
      // Unlike
      await this.prisma.$transaction([
        this.prisma.userDocumentLike.delete({ where: { id: existing.id } }),
        this.prisma.materialDetail.update({
          where: { materialId: documentId },
          data: { totalLike: { decrement: 1 } },
        }),
      ]);

      const updated = await this.prisma.materialDetail.findUnique({
        where: { materialId: documentId },
      });

      return { liked: false, totalLikes: updated?.totalLike || 0 };
    } else {
      // Like
      await this.prisma.$transaction([
        this.prisma.userDocumentLike.create({ data: { userId, materialId: documentId } }),
        this.prisma.materialDetail.update({
          where: { materialId: documentId },
          data: { totalLike: { increment: 1 } },
        }),
      ]);

      const updated = await this.prisma.materialDetail.findUnique({
        where: { materialId: documentId },
      });

      return { liked: true, totalLikes: updated?.totalLike || 0 };
    }
  }

  // Track download
  async trackDownload(documentId: string, userId?: string, ipAddress?: string) {
    const document = await this.prisma.supplementaryMaterial.findUnique({
      where: { id: documentId },
      include: { materialDetail: true },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Track download
    await this.prisma.userDocumentDownload.create({
      data: {
        materialId: documentId,
        userId,
        ipAddress,
      },
    });

    // Increment counter
    const updated = await this.prisma.materialDetail.update({
      where: { materialId: documentId },
      data: { totalDownload: { increment: 1 } },
    });

    return {
      url: document.url,
      totalDownloads: updated.totalDownload,
    };
  }

  // Get user's uploaded documents
  async getMyDocuments(userId: string, query: GetDocumentsQuery) {
    return this.getDocuments({ ...query, uploaderId: userId }, userId);
  }

  // Get user's liked documents
  async getMyLikedDocuments(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [likes, totalItems] = await Promise.all([
      this.prisma.userDocumentLike.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          material: {
            include: {
              uploader: {
                select: { id: true, name: true, avatar: true },
              },
              category: {
                select: { id: true, name: true },
              },
              materialDetail: {
                include: {
                  documentTags: {
                    include: {
                      documentTag: {
                        select: { id: true, name: true, slug: true, color: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.userDocumentLike.count({ where: { userId } }),
    ]);

    return {
      data: likes.map(like => this.transformDocument(like.material, userId)),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  // Admin: Get all documents
  async getAdminDocuments(query: GetDocumentsQuery) {
    const { page, limit, search, type, categoryId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SupplementaryMaterialWhereInput = {
      uploaderId: { not: null },
      lessonId: null,
      courseId: null,
      ...(categoryId ? { categoryId } : {}),
      ...(type ? { materialType: type } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    };

    const [documents, totalItems] = await Promise.all([
      this.prisma.supplementaryMaterial.findMany({
        where,
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
        include: {
          uploader: {
            select: { id: true, name: true, avatar: true },
          },
          category: {
            select: { id: true, name: true },
          },
          materialDetail: {
            include: {
              documentTags: {
                include: {
                  documentTag: {
                    select: { id: true, name: true, slug: true, color: true },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.supplementaryMaterial.count({ where }),
    ]);

    return {
      data: documents.map(doc => this.transformDocument(doc)),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  // Admin: Toggle verified
  async toggleVerified(documentId: string, isVerified: boolean) {
    const document = await this.prisma.supplementaryMaterial.findUnique({
      where: { id: documentId },
      include: { materialDetail: true },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    if (!document.materialDetail) {
      throw new NotFoundException('Document detail not found');
    }

    await this.prisma.materialDetail.update({
      where: { materialId: documentId },
      data: { isVerified },
    });

    return this.getDocumentById(documentId);
  }

  // Admin: Delete any document
  async adminDeleteDocument(id: string) {
    const document = await this.prisma.supplementaryMaterial.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    await this.prisma.$transaction([
      this.prisma.userDocumentLike.deleteMany({ where: { materialId: id } }),
      this.prisma.userDocumentDownload.deleteMany({ where: { materialId: id } }),
      this.prisma.userDocumentView.deleteMany({ where: { materialId: id } }),
      this.prisma.materialDetail.deleteMany({ where: { materialId: id } }),
      this.prisma.supplementaryMaterial.delete({ where: { id } }),
    ]);

    return { message: 'Document deleted successfully' };
  }
}


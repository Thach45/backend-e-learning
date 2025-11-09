import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateCourseContentBody, UpdateCourseContentBody, ReorderCourseContentsBody } from "./course-content.model";

const courseContentSelect = {
  id: true,
  courseId: true,
  parentId: true,
  title: true,
  orderIndex: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CourseContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCourseContents(courseId: string, instructorId: string) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only view contents for your own courses");
    }

    const contents = await this.prisma.courseContent.findMany({
      where: { courseId },
      select: courseContentSelect,
      orderBy: { orderIndex: "asc" },
    });

    // Build hierarchical structure
    type ContentNode = typeof contents[0] & { children: ContentNode[] };
    const contentMap = new Map<string, ContentNode>(
      contents.map(c => [c.id, { ...c, children: [] }])
    );
    const rootContents: ContentNode[] = [];

    for (const content of contents) {
      const node = contentMap.get(content.id)!;
      if (content.parentId) {
        const parent = contentMap.get(content.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          rootContents.push(node);
        }
      } else {
        rootContents.push(node);
      }
    }

    return rootContents;
  }

  async getCourseContentById(id: string, courseId: string, instructorId: string) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only view contents for your own courses");
    }

    const content = await this.prisma.courseContent.findFirst({
      where: { id, courseId },
      select: courseContentSelect,
    });
    if (!content) {
      throw new NotFoundException(`Course content with ID ${id} not found`);
    }
    return content;
  }

  async createCourseContent(body: CreateCourseContentBody, instructorId: string) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: body.courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${body.courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only create contents for your own courses");
    }

    // Validate parentId if provided
    if (body.parentId) {
      const parent = await this.prisma.courseContent.findFirst({
        where: { id: body.parentId, courseId: body.courseId },
        select: { id: true },
      });
      if (!parent) {
        throw new NotFoundException(`Parent content with ID ${body.parentId} not found`);
      }
    }

    const created = await this.prisma.courseContent.create({
      data: {
        courseId: body.courseId,
        parentId: body.parentId ?? null,
        title: body.title,
        orderIndex: body.orderIndex ?? 0,
      },
      select: courseContentSelect,
    });
    return created;
  }

  async updateCourseContent(id: string, courseId: string, body: UpdateCourseContentBody, instructorId: string) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only update contents for your own courses");
    }

    const existing = await this.prisma.courseContent.findFirst({
      where: { id, courseId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Course content with ID ${id} not found`);
    }

    // Validate parentId if provided
    if (body.parentId !== undefined) {
      if (body.parentId === id) {
        throw new BadRequestException("Content cannot be its own parent");
      }
      if (body.parentId) {
        const parent = await this.prisma.courseContent.findFirst({
          where: { id: body.parentId, courseId },
          select: { id: true },
        });
        if (!parent) {
          throw new NotFoundException(`Parent content with ID ${body.parentId} not found`);
        }
      }
    }

    const updated = await this.prisma.courseContent.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        parentId: body.parentId ?? undefined,
        orderIndex: body.orderIndex ?? undefined,
      },
      select: courseContentSelect,
    });
    return updated;
  }

  async deleteCourseContent(id: string, courseId: string, instructorId: string) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only delete contents for your own courses");
    }

    const existing = await this.prisma.courseContent.findFirst({
      where: { id, courseId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Course content with ID ${id} not found`);
    }

    // Check if has children
    const children = await this.prisma.courseContent.findMany({
      where: { parentId: id },
      select: { id: true },
    });
    if (children.length > 0) {
      throw new BadRequestException("Cannot delete content with children. Please delete children first.");
    }

    // Check if has lessons
    const lessons = await this.prisma.lesson.findMany({
      where: { contentId: id },
      select: { id: true },
    });
    if (lessons.length > 0) {
      throw new BadRequestException("Cannot delete content with lessons. Please delete lessons first.");
    }

    await this.prisma.courseContent.delete({
      where: { id },
    });
    return { success: true };
  }

  async reorderCourseContents(courseId: string, body: ReorderCourseContentsBody, instructorId: string) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only reorder contents for your own courses");
    }

    // Update orderIndex for all contents in transaction
    await this.prisma.$transaction(
      body.contents.map(({ id, orderIndex }) =>
        this.prisma.courseContent.update({
          where: { id },
          data: { orderIndex },
        })
      )
    );

    return { success: true };
  }
}


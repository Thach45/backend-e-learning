import { Injectable, BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateCourseDetailBody, UpdateCourseDetailBody } from "./course-detail.model";

const courseDetailSelect = {
  id: true,
  courseId: true,
  description: true,
  content: true,
  objectives: true,
  requirements: true,
  targetAudience: true,
  benefits: true,
  relatedCourses: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CourseDetailRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getCourseDetailByCourseId(courseId: string, checkPublished: boolean = false) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, status: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (checkPublished && course.status !== "PUBLISHED") {
      throw new NotFoundException(`Course detail not available`);
    }

    const detail = await this.prisma.courseDetail.findFirst({
      where: { courseId, deletedAt: null },
      select: courseDetailSelect,
    });
    if (!detail) {
      throw new NotFoundException(`Course detail for course ${courseId} not found`);
    }
    return detail;
  }

  async createCourseDetail(body: CreateCourseDetailBody, instructorId: string) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: body.courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${body.courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only create detail for your own courses");
    }

    // Check if detail already exists
    const existing = await this.prisma.courseDetail.findFirst({
      where: { courseId: body.courseId, deletedAt: null },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(`Course detail for course ${body.courseId} already exists`);
    }

    const created = await this.prisma.courseDetail.create({
      data: {
        courseId: body.courseId,
        description: body.description,
        content: body.content,
        objectives: body.objectives,
        requirements: body.requirements,
        targetAudience: body.targetAudience,
        benefits: body.benefits,
        relatedCourses: body.relatedCourses ?? [],
      },
      select: courseDetailSelect,
    });
    return created;
  }

  async updateCourseDetail(courseId: string, body: UpdateCourseDetailBody, instructorId: string) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only update detail for your own courses");
    }

    const existing = await this.prisma.courseDetail.findFirst({
      where: { courseId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Course detail for course ${courseId} not found`);
    }

    const updated = await this.prisma.courseDetail.update({
      where: { id: existing.id },
      data: {
        description: body.description ?? undefined,
        content: body.content ?? undefined,
        objectives: body.objectives ?? undefined,
        requirements: body.requirements ?? undefined,
        targetAudience: body.targetAudience ?? undefined,
        benefits: body.benefits ?? undefined,
        relatedCourses: body.relatedCourses ?? undefined,
      },
      select: courseDetailSelect,
    });
    return updated;
  }

  async deleteCourseDetail(courseId: string, instructorId: string) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException("You can only delete detail for your own courses");
    }

    const existing = await this.prisma.courseDetail.findFirst({
      where: { courseId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Course detail for course ${courseId} not found`);
    }

    const deleted = await this.prisma.courseDetail.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
      select: courseDetailSelect,
    });
    return deleted;
  }
}


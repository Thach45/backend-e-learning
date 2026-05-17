import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { Prisma, StorageType } from "@prisma/client";
import { CreateLessonBody, UpdateLessonBody } from "./lessons.model";

const lessonSelect = {
  id: true,
  contentId: true,
  title: true,
  storageType: true,
  storageUrl: true,
  contentText: true,
  duration: true,
  createdAt: true,
} as const;

@Injectable()
export class LessonsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parse YouTube URL and extract video ID
   * Supports formats:
   * - https://www.youtube.com/watch?v=VIDEO_ID
   * - https://youtu.be/VIDEO_ID
   * - https://www.youtube.com/embed/VIDEO_ID
   * - https://youtube.com/watch?v=VIDEO_ID
   */
  private parseYouTubeUrl(url: string): string | null {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If URL is already just a video ID (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    return null;
  }

  /**
   * Normalize storageUrl based on storageType
   * For YouTube: extract video ID and return it
   */
  private normalizeStorageUrl(
    storageType: StorageType,
    storageUrl?: string | null,
  ): string | null {
    if (!storageUrl) return null;

    if (storageType === "YOUTUBE") {
      const videoId = this.parseYouTubeUrl(storageUrl);
      if (!videoId) {
        throw new BadRequestException("Invalid YouTube URL format");
      }
      return videoId;
    }

    return storageUrl;
  }

  async getLessons(courseId: string, contentId: string, instructorId: string) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException(
        "You can only view lessons for your own courses",
      );
    }

    // Validate content exists and belongs to course
    const content = await this.prisma.courseContent.findFirst({
      where: { id: contentId, courseId },
      select: { id: true },
    });
    if (!content) {
      throw new NotFoundException(
        `Course content with ID ${contentId} not found`,
      );
    }

    const lessons = await this.prisma.lesson.findMany({
      where: { contentId },
      select: lessonSelect,
      orderBy: { createdAt: "asc" },
    });

    return lessons;
  }

  async getLessonById(
    id: string,
    courseId: string,
    contentId: string,
    instructorId: string,
  ) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException(
        "You can only view lessons for your own courses",
      );
    }

    // Validate content exists and belongs to course
    const content = await this.prisma.courseContent.findFirst({
      where: { id: contentId, courseId },
      select: { id: true },
    });
    if (!content) {
      throw new NotFoundException(
        `Course content with ID ${contentId} not found`,
      );
    }

    const lesson = await this.prisma.lesson.findFirst({
      where: { id, contentId },
      select: lessonSelect,
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  async createLesson(body: CreateLessonBody, instructorId: string) {
    // Validate course exists and belongs to instructor
    const content = await this.prisma.courseContent.findFirst({
      where: { id: body.contentId },
      select: {
        id: true,
        courseId: true,
        course: { select: { id: true, instructorId: true, deletedAt: true } },
      },
    });
    if (!content) {
      throw new NotFoundException(
        `Course content with ID ${body.contentId} not found`,
      );
    }
    if (!content.course || content.course.deletedAt) {
      throw new NotFoundException(`Course not found`);
    }
    if (content.course.instructorId !== instructorId) {
      throw new BadRequestException(
        "You can only create lessons for your own courses",
      );
    }

    // Normalize storageUrl based on storageType
    const normalizedStorageUrl = this.normalizeStorageUrl(
      body.storageType as StorageType,
      body.storageUrl,
    );

    const created = await this.prisma.lesson.create({
      data: {
        contentId: body.contentId,
        title: body.title,
        storageType: body.storageType as StorageType,
        storageUrl: normalizedStorageUrl,
        contentText: body.contentText,
        duration: body.duration,
      },
      select: lessonSelect,
    });

    return created;
  }


  async updateLesson(
    id: string,
    courseId: string,
    contentId: string,
    body: UpdateLessonBody,
    instructorId: string,
  ) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException(
        "You can only update lessons for your own courses",
      );
    }

    // Validate content exists and belongs to course
    const content = await this.prisma.courseContent.findFirst({
      where: { id: contentId, courseId },
      select: { id: true },
    });
    if (!content) {
      throw new NotFoundException(
        `Course content with ID ${contentId} not found`,
      );
    }

    const existing = await this.prisma.lesson.findFirst({
      where: { id, contentId },
      select: { id: true, storageType: true, storageUrl: true },
    });
    if (!existing) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // Determine storageType (use existing if not provided)
    const storageType = (body.storageType ??
      existing.storageType) as StorageType;

    // Normalize storageUrl if provided and storageType is YOUTUBE
    let normalizedStorageUrl: string | null | undefined =
      body.storageUrl ?? undefined;
    if (body.storageUrl !== undefined && storageType === "YOUTUBE") {
      normalizedStorageUrl = this.normalizeStorageUrl(
        storageType,
        body.storageUrl,
      );
    } else if (body.storageUrl === null) {
      normalizedStorageUrl = null;
    }

    const updated = await this.prisma.lesson.update({
      where: { id },
      data: {
        title: body.title ?? undefined,
        storageType: body.storageType
          ? (body.storageType as StorageType)
          : undefined,
        storageUrl: normalizedStorageUrl,
        contentText: body.contentText ?? undefined,
        duration: body.duration ?? undefined,
      },
      select: lessonSelect,
    });

    return updated;
  }


  async deleteLesson(
    id: string,
    courseId: string,
    contentId: string,
    instructorId: string,
  ) {
    // Validate course exists and belongs to instructor
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    if (course.instructorId !== instructorId) {
      throw new BadRequestException(
        "You can only delete lessons for your own courses",
      );
    }

    // Validate content exists and belongs to course
    const content = await this.prisma.courseContent.findFirst({
      where: { id: contentId, courseId },
      select: { id: true },
    });
    if (!content) {
      throw new NotFoundException(
        `Course content with ID ${contentId} not found`,
      );
    }

    const existing = await this.prisma.lesson.findFirst({
      where: { id, contentId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    await this.prisma.lesson.delete({
      where: { id },
    });
    return { success: true };
  }
}

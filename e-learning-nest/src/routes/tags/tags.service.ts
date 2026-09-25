import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { slugify } from "src/shared/helper/slugify";
import { CreateTagBody, GetTagsQuery, UpdateTagBody } from "./tags.model";

const tagSelect = { id: true, name: true, slug: true, type: true, categoryId: true } as const;

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Danh sách công khai: chỉ thẻ đang bật. */
  list(query: GetTagsQuery) {
    return this.prisma.tag.findMany({
      where: {
        isActive: true,
        ...(query.type ? { type: query.type } : {}),
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        // Tìm theo tên hoặc slug (không dấu): gõ "lap trinh" vẫn ra "Lập trình web"
        ...(query.q
          ? { OR: [{ name: { contains: query.q, mode: "insensitive" } }, { slug: { contains: slugify(query.q) } }] }
          : {}),
      },
      select: tagSelect,
      orderBy: { name: "asc" },
      take: query.limit,
    });
  }

  async listAdmin() {
    const rows = await this.prisma.tag.findMany({
      select: { ...tagSelect, isActive: true, _count: { select: { courses: true, users: true } } },
      orderBy: { name: "asc" },
    });
    return rows.map(({ _count, ...t }) => ({ ...t, coursesCount: _count.courses, usersCount: _count.users }));
  }

  async create(body: CreateTagBody) {
    const slug = slugify(body.name);
    if (!slug) throw new ConflictException("Tên thẻ không hợp lệ");
    try {
      return await this.prisma.tag.create({
        data: { name: body.name, slug, type: body.type, categoryId: body.categoryId ?? null },
        select: { ...tagSelect, isActive: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException("Thẻ này đã tồn tại");
      }
      throw e;
    }
  }

  async update(id: string, body: UpdateTagBody) {
    const existing = await this.prisma.tag.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundException("Không tìm thấy thẻ");
    try {
      return await this.prisma.tag.update({
        where: { id },
        data: {
          ...(body.name ? { name: body.name, slug: slugify(body.name) } : {}),
          ...(body.type ? { type: body.type } : {}),
          ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
          ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
        },
        select: { ...tagSelect, isActive: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        throw new ConflictException("Đã có thẻ khác trùng tên");
      }
      throw e;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.tag.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw new NotFoundException("Không tìm thấy thẻ");
    // CourseTag và UserInterest bị xoá theo (onDelete: Cascade)
    await this.prisma.tag.delete({ where: { id } });
    return { success: true };
  }

  /** Gán thẻ cho khoá học: chỉ giảng viên của khoá (hoặc admin) và chỉ dùng thẻ đang bật. Thay thế toàn bộ tập thẻ cũ. */
  async setCourseTags(courseId: string, tagIds: string[], actor: { userId: string; roleName?: string }) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true, instructorId: true },
    });
    if (!course) throw new NotFoundException("Không tìm thấy khóa học");
    if (actor.roleName !== "ADMIN" && course.instructorId !== actor.userId) {
      throw new ForbiddenException("Bạn chỉ được gán thẻ cho khóa học của mình");
    }

    const unique = [...new Set(tagIds)];
    const valid = unique.length
      ? await this.prisma.tag.findMany({ where: { id: { in: unique }, isActive: true }, select: { id: true } })
      : [];

    await this.prisma.$transaction([
      this.prisma.courseTag.deleteMany({ where: { courseId } }),
      this.prisma.courseTag.createMany({ data: valid.map((t) => ({ courseId, tagId: t.id })) }),
    ]);

    return this.prisma.tag.findMany({
      where: { courses: { some: { courseId } } },
      select: tagSelect,
      orderBy: { name: "asc" },
    });
  }
}

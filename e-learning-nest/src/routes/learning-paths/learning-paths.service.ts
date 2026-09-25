import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { slugify } from "src/shared/helper/slugify";
import { COURSE_CARD_SELECT, PUBLIC_COURSE_WHERE, toCourseCard } from "src/shared/helper/course-card";

export const MAX_PATH_COURSES = 20;
type PathInput = { title: string; slug?: string; description?: string | null; coverUrl?: string | null; isPublished: boolean; courses: { courseId: string; note?: string | null }[] };

@Injectable()
export class LearningPathsService {
  constructor(private readonly prisma: PrismaService) {}

  private async uniqueSlug(wanted: string, excludeId?: string) {
    const base = slugify(wanted) || "lo-trinh";
    for (let n = 1; n < 50; n++) {
      const slug = n === 1 ? base : `${base}-${n}`;
      const clash = await this.prisma.learningPath.findFirst({ where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true } });
      if (!clash) return slug;
    }
    throw new ConflictException("Không tạo được đường dẫn duy nhất, hãy đổi tiêu đề.");
  }

  /** Mọi khoá trong lộ trình phải tồn tại, đang công bố và không trùng nhau. */
  private async checkCourses(courses: PathInput["courses"]) {
    if (courses.length > MAX_PATH_COURSES) throw new BadRequestException(`Một lộ trình tối đa ${MAX_PATH_COURSES} khoá học.`);
    const ids = courses.map((c) => c.courseId);
    if (new Set(ids).size !== ids.length) throw new BadRequestException("Có khoá học bị trùng trong lộ trình.");
    const found = await this.prisma.course.count({ where: { id: { in: ids }, ...PUBLIC_COURSE_WHERE } });
    if (found !== ids.length) throw new BadRequestException("Có khoá học không tồn tại hoặc chưa được công bố.");
  }

  private courseRows(courses: PathInput["courses"]) {
    return courses.map((c, i) => ({ courseId: c.courseId, position: i, note: c.note ?? null }));
  }

  // ----- Công khai -----
  async listPublic() {
    const rows = await this.prisma.learningPath.findMany({
      where: { isPublished: true },
      orderBy: { updatedAt: "desc" },
      select: { id: true, slug: true, title: true, description: true, coverUrl: true, _count: { select: { courses: { where: { course: PUBLIC_COURSE_WHERE } } } } },
    });
    return rows.filter((r) => r._count.courses > 0).map(({ _count, ...r }) => ({ ...r, courseCount: _count.courses }));
  }

  async getPublic(slug: string) {
    const p = await this.prisma.learningPath.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true, slug: true, title: true, description: true, coverUrl: true,
        courses: { where: { course: PUBLIC_COURSE_WHERE }, orderBy: { position: "asc" }, select: { note: true, course: { select: COURSE_CARD_SELECT } } },
      },
    });
    if (!p) throw new NotFoundException("Không tìm thấy lộ trình.");
    return { id: p.id, slug: p.slug, title: p.title, description: p.description, coverUrl: p.coverUrl, courses: p.courses.map((c) => ({ ...toCourseCard(c.course), note: c.note })) };
  }

  /** Tiến độ của người dùng: bước nào đã ghi danh / hoàn thành. Bước hiện tại là khoá đầu tiên chưa hoàn thành. */
  async progress(slug: string, userId: string) {
    const path = await this.getPublic(slug);
    const ids = path.courses.map((c) => c.id);
    const enrollments = await this.prisma.enrollment.findMany({ where: { userId, courseId: { in: ids } }, select: { courseId: true, completedAt: true } });
    const byCourse = new Map(enrollments.map((e) => [e.courseId, e]));
    const steps = path.courses.map((c) => ({ courseId: c.id, enrolled: byCourse.has(c.id), completed: !!byCourse.get(c.id)?.completedAt }));
    const completed = steps.filter((s) => s.completed).length;
    const current = steps.find((s) => !s.completed)?.courseId ?? null;
    return { steps, completed, total: steps.length, percent: steps.length ? Math.round((completed / steps.length) * 100) : 0, currentCourseId: current };
  }

  // ----- Quản trị -----
  adminList() {
    return this.prisma.learningPath.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, slug: true, title: true, isPublished: true, updatedAt: true, _count: { select: { courses: true } } } })
      .then((rows) => rows.map(({ _count, ...r }) => ({ ...r, courseCount: _count.courses })));
  }

  async adminGet(id: string) {
    const p = await this.prisma.learningPath.findUnique({ where: { id }, include: { courses: { orderBy: { position: "asc" }, select: { courseId: true, note: true, course: { select: { title: true, status: true } } } } } });
    if (!p) throw new NotFoundException("Không tìm thấy lộ trình.");
    return p;
  }

  async create(input: PathInput, userId: string) {
    await this.checkCourses(input.courses);
    const slug = await this.uniqueSlug(input.slug || input.title);
    return this.prisma.learningPath.create({
      data: { slug, title: input.title, description: input.description ?? null, coverUrl: input.coverUrl ?? null, isPublished: input.isPublished, createdById: userId, courses: { create: this.courseRows(input.courses) } },
    });
  }

  async update(id: string, input: Partial<PathInput>) {
    const current = await this.adminGet(id);
    if (input.courses) await this.checkCourses(input.courses);
    const data: any = {};
    for (const k of ["title", "description", "coverUrl", "isPublished"] as const) if (input[k] !== undefined) data[k] = input[k];
    if (input.slug !== undefined && input.slug !== current.slug) data.slug = await this.uniqueSlug(input.slug, id);
    return this.prisma.$transaction(async (tx) => {
      if (input.courses) {
        // Thay toàn bộ danh sách để thứ tự luôn liền mạch
        await tx.learningPathCourse.deleteMany({ where: { pathId: id } });
        data.courses = { create: this.courseRows(input.courses) };
      }
      return tx.learningPath.update({ where: { id }, data });
    });
  }

  async remove(id: string) {
    await this.adminGet(id);
    await this.prisma.learningPath.delete({ where: { id } });
    return { deleted: true };
  }
}

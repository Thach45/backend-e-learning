import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { COURSE_CARD_SELECT, PUBLIC_COURSE_WHERE, toCourseCard } from "src/shared/helper/course-card";

export const MAX_COLLECTIONS = 20;
export const MAX_COURSES_PER_COLLECTION = 100;

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async own(id: string, userId: string) {
    const c = await this.prisma.collection.findUnique({ where: { id }, select: { id: true, userId: true } });
    if (!c) throw new NotFoundException("Không tìm thấy bộ sưu tập.");
    if (c.userId !== userId) throw new ForbiddenException("Đây không phải bộ sưu tập của bạn.");
    return c;
  }

  /** Danh sách của tôi. Có `courseId` thì mỗi bộ sưu tập kèm cờ `contains` (để hiện dấu tick ở nút "Thêm vào bộ sưu tập"). */
  async mine(userId: string, courseId?: string) {
    const rows = await this.prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, title: true, description: true, isPublic: true, updatedAt: true,
        _count: { select: { courses: { where: { course: PUBLIC_COURSE_WHERE } } } },
        ...(courseId ? { courses: { where: { courseId }, select: { courseId: true } } } : {}),
      },
    });
    return rows.map((r: any) => ({ id: r.id, title: r.title, description: r.description, isPublic: r.isPublic, updatedAt: r.updatedAt, courseCount: r._count.courses, ...(courseId ? { contains: r.courses.length > 0 } : {}) }));
  }

  async create(userId: string, input: { title: string; description?: string | null; isPublic: boolean }) {
    const count = await this.prisma.collection.count({ where: { userId } });
    if (count >= MAX_COLLECTIONS) throw new ConflictException(`Bạn chỉ tạo được tối đa ${MAX_COLLECTIONS} bộ sưu tập.`);
    return this.prisma.collection.create({ data: { userId, title: input.title, description: input.description ?? null, isPublic: input.isPublic } });
  }

  async update(id: string, userId: string, input: { title?: string; description?: string | null; isPublic?: boolean }) {
    await this.own(id, userId);
    return this.prisma.collection.update({ where: { id }, data: input });
  }

  async remove(id: string, userId: string) {
    await this.own(id, userId);
    await this.prisma.collection.delete({ where: { id } });
    return { deleted: true };
  }

  async addCourse(id: string, userId: string, courseId: string) {
    await this.own(id, userId);
    const course = await this.prisma.course.findFirst({ where: { id: courseId, ...PUBLIC_COURSE_WHERE }, select: { id: true } });
    if (!course) throw new NotFoundException("Không tìm thấy khoá học.");
    const count = await this.prisma.collectionCourse.count({ where: { collectionId: id } });
    if (count >= MAX_COURSES_PER_COLLECTION) throw new ConflictException(`Mỗi bộ sưu tập tối đa ${MAX_COURSES_PER_COLLECTION} khoá học.`);
    await this.prisma.collectionCourse.upsert({ where: { collectionId_courseId: { collectionId: id, courseId } }, create: { collectionId: id, courseId }, update: {} });
    await this.prisma.collection.update({ where: { id }, data: { updatedAt: new Date() } });
    return { added: true };
  }

  async removeCourse(id: string, userId: string, courseId: string) {
    await this.own(id, userId);
    await this.prisma.collectionCourse.deleteMany({ where: { collectionId: id, courseId } });
    return { removed: true };
  }

  /** Chủ sở hữu xem được mọi bộ sưu tập của mình; người khác chỉ xem được bộ đã công khai. Không lộ email chủ sở hữu. */
  async detail(id: string, viewerId?: string) {
    const c = await this.prisma.collection.findUnique({
      where: { id },
      select: {
        id: true, title: true, description: true, isPublic: true, userId: true, updatedAt: true,
        user: { select: { name: true } },
        courses: { where: { course: PUBLIC_COURSE_WHERE }, orderBy: { addedAt: "desc" }, select: { course: { select: COURSE_CARD_SELECT } } },
      },
    });
    // Riêng tư thì báo 404 (không cho dò sự tồn tại)
    if (!c || (!c.isPublic && c.userId !== viewerId)) throw new NotFoundException("Không tìm thấy bộ sưu tập.");
    return { id: c.id, title: c.title, description: c.description, isPublic: c.isPublic, updatedAt: c.updatedAt, ownerName: c.user.name, isOwner: c.userId === viewerId, courses: c.courses.map((x) => toCourseCard(x.course)) };
  }
}

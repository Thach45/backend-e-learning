import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { COURSE_CARD_SELECT, PUBLIC_COURSE_WHERE, toCourseCard } from "src/shared/helper/course-card";

type Input = { isPublic?: boolean; headline?: string | null; bio?: string | null; showCourses?: boolean; showBadges?: boolean };

@Injectable()
export class PublicProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async mine(userId: string) {
    const p = await this.prisma.publicProfile.findUnique({ where: { userId } });
    return p ?? { userId, isPublic: false, headline: null, bio: null, showCourses: true, showBadges: true, updatedAt: null };
  }

  update(userId: string, input: Input) {
    return this.prisma.publicProfile.upsert({ where: { userId }, create: { userId, ...input }, update: input });
  }

  /**
   * Chỉ hiển thị khi người dùng đã bật công khai và tài khoản còn hoạt động. Mọi trường hợp khác đều 404 (không cho dò tài khoản).
   * Không bao giờ trả email, số điện thoại hay thông tin đăng nhập; chỉ trả những phần người dùng cho phép.
   */
  async view(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null, status: "ACTIVE", publicProfile: { is: { isPublic: true } } },
      select: { id: true, name: true, avatar: true, createdAt: true, publicProfile: true },
    });
    const prof = user?.publicProfile;
    if (!user || !prof) throw new NotFoundException("Không tìm thấy hồ sơ.");

    const [completed, badges, enrolledCount] = await Promise.all([
      prof.showCourses
        ? this.prisma.enrollment.findMany({ where: { userId, completedAt: { not: null }, course: PUBLIC_COURSE_WHERE }, orderBy: { completedAt: "desc" }, take: 30, select: { completedAt: true, course: { select: COURSE_CARD_SELECT } } })
        : Promise.resolve(null),
      prof.showBadges
        ? this.prisma.userBadge.findMany({ where: { userId }, orderBy: { awardedAt: "desc" }, select: { awardedAt: true, badge: { select: { code: true, name: true, description: true, icon: true } } } })
        : Promise.resolve(null),
      this.prisma.enrollment.count({ where: { userId } }),
    ]);

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      headline: prof.headline,
      bio: prof.bio,
      memberSince: user.createdAt,
      stats: { enrolledCourses: enrolledCount, completedCourses: completed?.length ?? null, badges: badges?.length ?? null },
      completedCourses: completed?.map((e) => ({ ...toCourseCard(e.course), completedAt: e.completedAt })) ?? null,
      badges: badges?.map((b) => ({ ...b.badge, awardedAt: b.awardedAt })) ?? null,
    };
  }
}

import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import type { Audience } from "./email-campaigns.model";

export interface Actor {
  userId: string;
  roleName?: string;
}
export interface Recipient {
  id: string;
  email: string;
  name: string;
}

const MAX_RECIPIENTS = 5000;

@Injectable()
export class CampaignAudienceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ai được gửi cho ai:
   *  - ADMIN: mọi đối tượng trừ INSTRUCTOR_STUDENTS (dành riêng cho giảng viên); được đánh dấu thông báo dịch vụ.
   *  - INSTRUCTOR: chỉ học viên đã ghi danh khoá CỦA MÌNH (COURSE_ENROLLEES hoặc INSTRUCTOR_STUDENTS); không được đánh dấu thông báo dịch vụ.
   */
  async assertAllowed(audience: Audience, actor: Actor, isServiceNotice: boolean) {
    if (actor.roleName === "ADMIN") {
      if (audience.type === "INSTRUCTOR_STUDENTS") {
        throw new BadRequestException("Kiểu đối tượng này dành cho giảng viên. Admin hãy chọn học viên của một khóa học cụ thể.");
      }
      if (audience.type === "COURSE_ENROLLEES") await this.assertCourseExists(audience.courseId);
      return;
    }

    if (actor.roleName !== "INSTRUCTOR") throw new ForbiddenException("Bạn không có quyền gửi email");
    if (isServiceNotice) throw new ForbiddenException("Chỉ admin được gửi thông báo dịch vụ");

    if (audience.type === "INSTRUCTOR_STUDENTS") return;
    if (audience.type === "COURSE_ENROLLEES") {
      const course = await this.prisma.course.findFirst({
        where: { id: audience.courseId, deletedAt: null },
        select: { instructorId: true },
      });
      if (!course) throw new NotFoundException("Không tìm thấy khóa học");
      if (course.instructorId !== actor.userId) throw new ForbiddenException("Bạn chỉ được gửi email cho học viên khóa học của mình");
      return;
    }
    throw new ForbiddenException("Giảng viên chỉ được gửi email cho học viên đã ghi danh khóa học của mình");
  }

  private async assertCourseExists(courseId: string) {
    const c = await this.prisma.course.findFirst({ where: { id: courseId, deletedAt: null }, select: { id: true } });
    if (!c) throw new NotFoundException("Không tìm thấy khóa học");
  }

  /**
   * Danh sách người nhận tại thời điểm gửi: tài khoản ACTIVE, chưa từ chối nhận thư (trừ thông báo dịch vụ),
   * chưa bị chặn vì bounce/complaint, loại trùng địa chỉ. Không lưu snapshot.
   */
  async resolve(audience: Audience, opts: { isServiceNotice: boolean; senderId: string }): Promise<Recipient[]> {
    const where: Prisma.UserWhereInput = {
      status: "ACTIVE",
      deletedAt: null,
      ...(opts.isServiceNotice ? {} : { emailCampaignOptOut: false }),
    };

    switch (audience.type) {
      case "ALL_USERS":
        break;
      case "ROLE":
        where.userRoles = { some: { role: { name: audience.role } } };
        break;
      case "COURSE_ENROLLEES":
        where.enrollments = { some: { courseId: audience.courseId } };
        break;
      case "INSTRUCTOR_STUDENTS":
        where.enrollments = { some: { course: { instructorId: opts.senderId, deletedAt: null } } };
        break;
      case "INTEREST_TAG":
        // Nhắm theo sở thích là dùng hồ sơ học tập: chỉ áp dụng cho người đã đồng ý cá nhân hoá
        where.interests = { some: { tagId: audience.tagId } };
        where.learningProfile = { allowPersonalization: true };
        break;
      case "SPECIFIC_USERS":
        where.id = { in: audience.userIds };
        break;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true },
      take: MAX_RECIPIENTS,
      orderBy: { createdAt: "asc" },
    });

    const suppressed = new Set(
      (
        await this.prisma.emailSuppression.findMany({
          where: { email: { in: users.map((u) => u.email.toLowerCase()) } },
          select: { email: true },
        })
      ).map((s) => s.email.toLowerCase()),
    );

    const seen = new Set<string>();
    return users.filter((u) => {
      const e = u.email.toLowerCase();
      if (suppressed.has(e) || seen.has(e)) return false;
      seen.add(e);
      return true;
    });
  }
}

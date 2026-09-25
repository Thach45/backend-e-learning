import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { CsvValue, toCsv } from "src/shared/helper/csv";
import { AdminAnalyticsRepo } from "./admin-analytics.repo";
import { ExportQuery, ExportResource } from "./admin-analytics.model";

// Giới hạn cứng để một lần xuất không làm nghẽn server
const MAX_ROWS = 50000;

type Dataset = { headers: string[]; rows: CsvValue[][] };

@Injectable()
export class AdminExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsRepo: AdminAnalyticsRepo,
  ) {}

  private dateRange(query: ExportQuery, field = "createdAt") {
    if (!query.from && !query.to) return {};
    return {
      [field]: {
        ...(query.from ? { gte: query.from } : {}),
        ...(query.to ? { lte: query.to } : {}),
      },
    };
  }

  async export(resource: ExportResource, query: ExportQuery): Promise<{ filename: string; csv: string }> {
    const { headers, rows } = await this.build(resource, query);
    const date = new Date().toISOString().slice(0, 10);
    return { filename: `${resource}-${date}.csv`, csv: toCsv(headers, rows) };
  }

  private async build(resource: ExportResource, query: ExportQuery): Promise<Dataset> {
    switch (resource) {
      case "users": {
        const users = await this.prisma.user.findMany({
          where: { deletedAt: null, ...this.dateRange(query) },
          take: MAX_ROWS,
          orderBy: { createdAt: "desc" },
          select: {
            id: true, name: true, email: true, phoneNumber: true, status: true, createdAt: true,
            userRoles: { select: { role: { select: { name: true } } } },
          },
        });
        return {
          headers: ["ID", "Họ tên", "Email", "Số điện thoại", "Trạng thái", "Vai trò", "Ngày tạo"],
          rows: users.map((u) => [
            u.id, u.name, u.email, u.phoneNumber, u.status,
            u.userRoles.map((r) => r.role.name).join(", "), u.createdAt,
          ]),
        };
      }
      case "courses": {
        const courses = await this.prisma.course.findMany({
          where: { deletedAt: null, ...this.dateRange(query) },
          take: MAX_ROWS,
          orderBy: { createdAt: "desc" },
          select: {
            id: true, title: true, status: true, level: true, price: true, salePrice: true, createdAt: true,
            instructor: { select: { name: true, email: true } },
            category: { select: { name: true } },
            _count: { select: { enrollments: true, reviews: true } },
          },
        });
        return {
          headers: ["ID", "Tên khóa học", "Giảng viên", "Email giảng viên", "Danh mục", "Trạng thái", "Cấp độ", "Giá", "Giá khuyến mãi", "Học viên", "Đánh giá", "Ngày tạo"],
          rows: courses.map((c) => [
            c.id, c.title, c.instructor.name, c.instructor.email, c.category?.name, c.status, c.level,
            c.price, c.salePrice, c._count.enrollments, c._count.reviews, c.createdAt,
          ]),
        };
      }
      case "enrollments": {
        const rows = await this.prisma.enrollment.findMany({
          where: this.dateRange(query, "enrolledAt"),
          take: MAX_ROWS,
          orderBy: { enrolledAt: "desc" },
          select: {
            enrolledAt: true, completedAt: true,
            user: { select: { name: true, email: true } },
            course: { select: { title: true } },
          },
        });
        return {
          headers: ["Học viên", "Email", "Khóa học", "Ngày ghi danh", "Ngày hoàn thành"],
          rows: rows.map((e) => [e.user.name, e.user.email, e.course.title, e.enrolledAt, e.completedAt]),
        };
      }
      case "reviews": {
        const rows = await this.prisma.review.findMany({
          where: this.dateRange(query),
          take: MAX_ROWS,
          orderBy: { createdAt: "desc" },
          select: {
            rating: true, comment: true, instructorReply: true, createdAt: true,
            user: { select: { name: true, email: true } },
            course: { select: { title: true } },
          },
        });
        return {
          headers: ["Học viên", "Email", "Khóa học", "Số sao", "Nhận xét", "Phản hồi của giảng viên", "Ngày tạo"],
          rows: rows.map((r) => [r.user.name, r.user.email, r.course.title, r.rating, r.comment, r.instructorReply, r.createdAt]),
        };
      }
      case "audit-logs": {
        const where: Prisma.AuditLogWhereInput = {
          ...(query.action ? { action: query.action } : {}),
          ...(query.targetType ? { targetType: query.targetType } : {}),
          ...this.dateRange(query),
        };
        const rows = await this.prisma.auditLog.findMany({
          where,
          take: MAX_ROWS,
          orderBy: { createdAt: "desc" },
          include: { actor: { select: { name: true, email: true } } },
        });
        return {
          headers: ["Thời gian", "Người thực hiện", "Email", "Hành động", "Loại đối tượng", "ID đối tượng", "IP", "Chi tiết"],
          rows: rows.map((l) => [
            l.createdAt, l.actor?.name, l.actor?.email, l.action, l.targetType, l.targetId, l.ipAddress,
            l.metadata ? JSON.stringify(l.metadata) : "",
          ]),
        };
      }
      case "reports": {
        const rows = await this.prisma.contentReport.findMany({
          where: {
            ...(query.status ? { status: query.status as any } : {}),
            ...this.dateRange(query),
          },
          take: MAX_ROWS,
          orderBy: { createdAt: "desc" },
          include: {
            reporter: { select: { name: true, email: true } },
            handledBy: { select: { name: true } },
          },
        });
        return {
          headers: ["Thời gian", "Người báo cáo", "Email", "Loại nội dung", "ID nội dung", "Lý do", "Chi tiết", "Nội dung bị báo cáo", "Ngữ cảnh", "Trạng thái", "Người xử lý", "Đã gỡ nội dung", "Ghi chú xử lý"],
          rows: rows.map((r) => [
            r.createdAt, r.reporter.name, r.reporter.email, r.targetType, r.targetId, r.reason, r.details,
            r.contentSnapshot, r.targetContext, r.status, r.handledBy?.name, r.contentRemoved ? "Có" : "Không", r.resolutionNote,
          ]),
        };
      }
      case "course-analytics": {
        const rows = await this.analyticsRepo.getCourseRows();
        return {
          headers: ["Khóa học", "Giảng viên", "Học viên", "Hoàn thành (người)", "Tỉ lệ hoàn thành %", "Điểm đánh giá TB", "Số đánh giá", "Hài lòng TB (khảo sát)", "Độ khó TB (khảo sát)", "Tỉ lệ giới thiệu %", "Lượt làm quiz", "Tỉ lệ đạt quiz %", "Câu hỏi", "Chưa trả lời"],
          rows: rows.map((r) => [
            r.title, r.instructorName, r.enrollments, r.completedLearners, r.completionRate, r.avgRating, r.reviewCount,
            r.avgSatisfaction, r.avgDifficulty, r.recommendRate, r.quizAttempts, r.quizPassRate, r.questions, r.unansweredQuestions,
          ]),
        };
      }
      case "instructor-analytics": {
        const rows = await this.analyticsRepo.getInstructorRows();
        return {
          headers: ["Giảng viên", "Email", "Số khóa học", "Học viên", "Điểm đánh giá TB", "Số đánh giá", "Người theo dõi"],
          rows: rows.map((r) => [r.name, r.email, r.courses, r.students, r.avgRating, r.reviewCount, r.followers]),
        };
      }
    }
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";

const SINGLETON = "singleton";
const STATS_TTL_MS = 60_000;

type BannerInput = { title: string; subtitle?: string | null; imageUrl: string; linkUrl?: string | null; ctaLabel?: string | null; position?: number; isActive?: boolean; startsAt?: Date | null; endsAt?: Date | null };
type TestimonialInput = { name: string; role?: string | null; avatarUrl?: string | null; content: string; rating?: number | null; position?: number; isActive?: boolean };
type SettingInput = { heroTitle?: string | null; heroSubtitle?: string | null; showCategories?: boolean; showFeatured?: boolean; showTestimonials?: boolean; showLatestPosts?: boolean };

@Injectable()
export class HomeConfigService {
  private stats?: { at: number; value: { learners: number; courses: number; avgRating: number | null; reviews: number } };

  constructor(private readonly prisma: PrismaService) {}

  private async getStats() {
    if (this.stats && Date.now() - this.stats.at < STATS_TTL_MS) return this.stats.value;
    const [learners, courses, agg] = await Promise.all([
      this.prisma.enrollment.groupBy({ by: ["userId"] }).then((r) => r.length),
      this.prisma.course.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      this.prisma.review.aggregate({ _avg: { rating: true }, _count: { _all: true } }),
    ]);
    const value = { learners, courses, avgRating: agg._avg.rating === null ? null : Math.round(agg._avg.rating * 10) / 10, reviews: agg._count._all };
    this.stats = { at: Date.now(), value };
    return value;
  }

  async getSettings() {
    return this.prisma.homeSetting.upsert({ where: { id: SINGLETON }, create: { id: SINGLETON }, update: {} });
  }

  /** Một lần gọi cho toàn bộ trang chủ. Chỉ số là số thật từ hệ thống (không có dữ liệu mẫu). */
  async getPublic() {
    const now = new Date();
    const [setting, banners, testimonials, latestPosts, stats] = await Promise.all([
      this.getSettings(),
      this.prisma.homeBanner.findMany({
        where: { isActive: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] },
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
        take: 8,
        select: { id: true, title: true, subtitle: true, imageUrl: true, linkUrl: true, ctaLabel: true },
      }),
      this.prisma.testimonial.findMany({ where: { isActive: true }, orderBy: [{ position: "asc" }, { createdAt: "desc" }], take: 12, select: { id: true, name: true, role: true, avatarUrl: true, content: true, rating: true } }),
      this.prisma.post.findMany({ where: { kind: "BLOG", status: "PUBLISHED", publishedAt: { lte: now } }, orderBy: { publishedAt: "desc" }, take: 3, select: { slug: true, title: true, excerpt: true, coverUrl: true, publishedAt: true } }),
      this.getStats(),
    ]);
    return {
      hero: { title: setting.heroTitle, subtitle: setting.heroSubtitle },
      sections: { categories: setting.showCategories, featured: setting.showFeatured, testimonials: setting.showTestimonials, latestPosts: setting.showLatestPosts },
      banners,
      testimonials: setting.showTestimonials ? testimonials : [],
      latestPosts: setting.showLatestPosts ? latestPosts : [],
      stats,
    };
  }

  updateSettings(input: SettingInput, userId: string) {
    return this.prisma.homeSetting.upsert({ where: { id: SINGLETON }, create: { id: SINGLETON, ...input, updatedById: userId }, update: { ...input, updatedById: userId } });
  }

  // ----- Banner -----
  listBanners() {
    return this.prisma.homeBanner.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });
  }
  createBanner(input: BannerInput) {
    return this.prisma.homeBanner.create({ data: input });
  }
  async updateBanner(id: string, input: Partial<BannerInput>) {
    await this.prisma.homeBanner.findUniqueOrThrow({ where: { id } }).catch(() => { throw new NotFoundException("Không tìm thấy banner."); });
    return this.prisma.homeBanner.update({ where: { id }, data: input });
  }
  async deleteBanner(id: string) {
    const res = await this.prisma.homeBanner.deleteMany({ where: { id } });
    if (!res.count) throw new NotFoundException("Không tìm thấy banner.");
    return { deleted: true };
  }

  // ----- Lời chứng thực -----
  listTestimonials() {
    return this.prisma.testimonial.findMany({ orderBy: [{ position: "asc" }, { createdAt: "desc" }] });
  }
  createTestimonial(input: TestimonialInput) {
    return this.prisma.testimonial.create({ data: input });
  }
  async updateTestimonial(id: string, input: Partial<TestimonialInput>) {
    await this.prisma.testimonial.findUniqueOrThrow({ where: { id } }).catch(() => { throw new NotFoundException("Không tìm thấy lời chứng thực."); });
    return this.prisma.testimonial.update({ where: { id }, data: input });
  }
  async deleteTestimonial(id: string) {
    const res = await this.prisma.testimonial.deleteMany({ where: { id } });
    if (!res.count) throw new NotFoundException("Không tìm thấy lời chứng thực.");
    return { deleted: true };
  }
}

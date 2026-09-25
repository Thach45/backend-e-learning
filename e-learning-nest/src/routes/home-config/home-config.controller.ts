import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Public } from "src/shared/decorator/auth.decorator";
import { Audit } from "src/shared/decorator/audit.decorator";
import { HomeConfigService } from "./home-config.service";

const httpsUrl = z.string().url().max(1000).refine((u) => u.startsWith("https://"), "Chỉ chấp nhận liên kết https");
// Liên kết của banner: https hoặc đường dẫn nội bộ (không cho // vì là URL giao thức tương đối)
const linkUrl = z.string().trim().max(500).refine((u) => u.startsWith("https://") || (u.startsWith("/") && !u.startsWith("//")), "Liên kết phải là https hoặc đường dẫn bắt đầu bằng /");
const optText = (max: number) => z.string().trim().max(max).nullish().transform((v) => (v ? v : null));

class IdParamsDto extends createZodDto(z.object({ id: z.string().uuid() }).strict()) {}

const bannerFields = {
  title: z.string().trim().min(1).max(120),
  subtitle: optText(250),
  imageUrl: httpsUrl,
  linkUrl: linkUrl.nullish().transform((v) => v || null),
  ctaLabel: optText(40),
  position: z.number().int().min(0).max(10_000),
  isActive: z.boolean(),
  startsAt: z.coerce.date().nullish(),
  endsAt: z.coerce.date().nullish(),
};
class CreateBannerDto extends createZodDto(z.object({ ...bannerFields, position: bannerFields.position.default(0), isActive: bannerFields.isActive.default(true) }).strict().refine((b) => !b.startsAt || !b.endsAt || b.startsAt < b.endsAt, "Ngày kết thúc phải sau ngày bắt đầu")) {}
class UpdateBannerDto extends createZodDto(z.object(bannerFields).partial().strict()) {}

const tFields = {
  name: z.string().trim().min(1).max(80),
  role: optText(120),
  avatarUrl: httpsUrl.nullish(),
  content: z.string().trim().min(1).max(600),
  rating: z.number().int().min(1).max(5).nullish(),
  position: z.number().int().min(0).max(10_000),
  isActive: z.boolean(),
};
class CreateTestimonialDto extends createZodDto(z.object({ ...tFields, position: tFields.position.default(0), isActive: tFields.isActive.default(true) }).strict()) {}
class UpdateTestimonialDto extends createZodDto(z.object(tFields).partial().strict()) {}

class UpdateSettingDto extends createZodDto(
  z.object({ heroTitle: optText(120), heroSubtitle: optText(300), showCategories: z.boolean(), showFeatured: z.boolean(), showTestimonials: z.boolean(), showLatestPosts: z.boolean() }).partial().strict(),
) {}

@Controller("api")
export class HomeConfigController {
  constructor(private readonly service: HomeConfigService) {}

  @Public()
  @Get("home")
  home() {
    return this.service.getPublic();
  }

  @Get("admin/home/settings")
  settings() {
    return this.service.getSettings();
  }
  @Audit("home.settings.update", "HomeSetting")
  @Put("admin/home/settings")
  updateSettings(@Body() body: UpdateSettingDto, @ActiveUser() user: any) {
    return this.service.updateSettings(body as any, user.userId);
  }

  @Get("admin/home/banners")
  banners() {
    return this.service.listBanners();
  }
  @Audit("home.banner.create", "HomeBanner")
  @Post("admin/home/banners")
  createBanner(@Body() body: CreateBannerDto) {
    return this.service.createBanner(body as any);
  }
  @Audit("home.banner.update", "HomeBanner", { idParam: "id" })
  @Put("admin/home/banners/:id")
  updateBanner(@Param() p: IdParamsDto, @Body() body: UpdateBannerDto) {
    return this.service.updateBanner(p.id, body as any);
  }
  @Audit("home.banner.delete", "HomeBanner", { idParam: "id" })
  @Delete("admin/home/banners/:id")
  deleteBanner(@Param() p: IdParamsDto) {
    return this.service.deleteBanner(p.id);
  }

  @Get("admin/home/testimonials")
  testimonials() {
    return this.service.listTestimonials();
  }
  @Audit("home.testimonial.create", "Testimonial")
  @Post("admin/home/testimonials")
  createTestimonial(@Body() body: CreateTestimonialDto) {
    return this.service.createTestimonial(body as any);
  }
  @Audit("home.testimonial.update", "Testimonial", { idParam: "id" })
  @Put("admin/home/testimonials/:id")
  updateTestimonial(@Param() p: IdParamsDto, @Body() body: UpdateTestimonialDto) {
    return this.service.updateTestimonial(p.id, body as any);
  }
  @Audit("home.testimonial.delete", "Testimonial", { idParam: "id" })
  @Delete("admin/home/testimonials/:id")
  deleteTestimonial(@Param() p: IdParamsDto) {
    return this.service.deleteTestimonial(p.id);
  }
}

import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Public } from "src/shared/decorator/auth.decorator";
import { Audit } from "src/shared/decorator/audit.decorator";
import { LearningPathsService } from "./learning-paths.service";

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(100);
const optText = (max: number) => z.string().trim().max(max).nullish().transform((v) => (v ? v : null));
class SlugDto extends createZodDto(z.object({ slug }).strict()) {}
class IdDto extends createZodDto(z.object({ id: z.string().uuid() }).strict()) {}
const fields = {
  title: z.string().trim().min(1).max(150),
  slug: slug.optional(),
  description: optText(1000),
  coverUrl: z.string().url().max(1000).refine((u) => u.startsWith("https://"), "Chỉ chấp nhận liên kết https").nullish(),
  isPublished: z.boolean(),
  courses: z.array(z.object({ courseId: z.string().uuid(), note: optText(200) }).strict()).max(20),
};
class CreateDto extends createZodDto(z.object({ ...fields, isPublished: fields.isPublished.default(false), courses: fields.courses.default([]) }).strict()) {}
class UpdateDto extends createZodDto(z.object(fields).partial().strict()) {}

@Controller("api")
export class LearningPathsController {
  constructor(private readonly service: LearningPathsService) {}

  @Public()
  @Get("paths")
  list() {
    return this.service.listPublic();
  }

  // Đặt trước paths/:slug để "admin" hay "progress" không bị coi là slug
  @Get("paths/:slug/progress")
  progress(@Param() p: SlugDto, @ActiveUser() user: any) {
    return this.service.progress(p.slug, user.userId);
  }

  @Public()
  @Get("paths/:slug")
  detail(@Param() p: SlugDto) {
    return this.service.getPublic(p.slug);
  }

  @Get("admin/paths")
  adminList() {
    return this.service.adminList();
  }

  @Get("admin/paths/:id")
  adminGet(@Param() p: IdDto) {
    return this.service.adminGet(p.id);
  }

  @Audit("path.create", "LearningPath")
  @Post("admin/paths")
  create(@Body() b: CreateDto, @ActiveUser() user: any) {
    return this.service.create(b as any, user.userId);
  }

  @Audit("path.update", "LearningPath", { idParam: "id" })
  @Put("admin/paths/:id")
  update(@Param() p: IdDto, @Body() b: UpdateDto) {
    return this.service.update(p.id, b as any);
  }

  @Audit("path.delete", "LearningPath", { idParam: "id" })
  @Delete("admin/paths/:id")
  remove(@Param() p: IdDto) {
    return this.service.remove(p.id);
  }
}

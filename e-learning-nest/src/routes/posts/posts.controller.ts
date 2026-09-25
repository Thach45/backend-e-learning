import { Body, Controller, Delete, Get, Param, Post as HttpPost, Put, Query } from "@nestjs/common";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Public } from "src/shared/decorator/auth.decorator";
import { Audit } from "src/shared/decorator/audit.decorator";
import { PostsService } from "./posts.service";

const slugParam = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(100);
const httpsUrl = z.string().url().max(1000).refine((u) => u.startsWith("https://"), "Chỉ chấp nhận liên kết https");
const kind = z.enum(["BLOG", "PAGE"]);
const status = z.enum(["DRAFT", "PUBLISHED"]);
const paging = { page: z.coerce.number().int().min(1).max(10_000).default(1), limit: z.coerce.number().int().min(1).max(50).default(12) };

class PublicListQueryDto extends createZodDto(z.object({ search: z.string().trim().max(100).optional(), ...paging })) {}
class SlugParamsDto extends createZodDto(z.object({ slug: slugParam }).strict()) {}
class IdParamsDto extends createZodDto(z.object({ id: z.string().uuid() }).strict()) {}
class AdminListQueryDto extends createZodDto(z.object({ kind: kind.optional(), status: status.optional(), search: z.string().trim().max(100).optional(), ...paging })) {}

const fields = {
  title: z.string().trim().min(1).max(200),
  slug: slugParam.optional(),
  excerpt: z.string().trim().max(300).nullish(),
  coverUrl: httpsUrl.nullish(),
  body: z.string().max(100_000),
  status,
  showInFooter: z.boolean(),
};
class CreatePostDto extends createZodDto(z.object({ kind, ...fields, showInFooter: fields.showInFooter.default(false), status: status.default("DRAFT") }).strict()) {}
class UpdatePostDto extends createZodDto(z.object(fields).partial().strict()) {}

@Controller("api")
export class PostsController {
  constructor(private readonly service: PostsService) {}

  @Public()
  @Get("blog")
  list(@Query() q: PublicListQueryDto) {
    return this.service.listBlog(q as any);
  }

  @Public()
  @Get("blog/:slug")
  blogPost(@Param() p: SlugParamsDto) {
    return this.service.getPublished("BLOG", p.slug);
  }

  // Khai báo trước pages/:slug để "footer" không bị coi là slug
  @Public()
  @Get("pages/footer")
  footer() {
    return this.service.footerPages();
  }

  @Public()
  @Get("pages/:slug")
  page(@Param() p: SlugParamsDto) {
    return this.service.getPublished("PAGE", p.slug);
  }

  @Get("admin/posts")
  adminList(@Query() q: AdminListQueryDto) {
    return this.service.adminList(q as any);
  }

  @Get("admin/posts/:id")
  adminGet(@Param() p: IdParamsDto) {
    return this.service.adminGet(p.id);
  }

  @Audit("post.create", "Post")
  @HttpPost("admin/posts")
  create(@Body() body: CreatePostDto, @ActiveUser() user: any) {
    return this.service.create(body as any, user.userId);
  }

  @Audit("post.update", "Post", { idParam: "id" })
  @Put("admin/posts/:id")
  update(@Param() p: IdParamsDto, @Body() body: UpdatePostDto) {
    return this.service.update(p.id, body as any);
  }

  @Audit("post.delete", "Post", { idParam: "id" })
  @Delete("admin/posts/:id")
  remove(@Param() p: IdParamsDto) {
    return this.service.remove(p.id);
  }
}

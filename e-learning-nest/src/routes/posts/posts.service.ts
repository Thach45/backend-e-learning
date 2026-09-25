import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PostKind, PostStatus } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { slugify } from "src/shared/helper/slugify";

export type PostInput = {
  kind: PostKind;
  title: string;
  slug?: string;
  excerpt?: string | null;
  coverUrl?: string | null;
  body: string;
  status: PostStatus;
  showInFooter: boolean;
};

const CARD = { id: true, kind: true, slug: true, title: true, excerpt: true, coverUrl: true, publishedAt: true, views: true, author: { select: { name: true } } } as const;
// Trang tĩnh giữ chỗ cho các đường dẫn hệ thống nên không cho trùng
const RESERVED_PAGE_SLUGS = new Set(["footer"]);

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  private publishedWhere(kind: PostKind): Prisma.PostWhereInput {
    return { kind, status: "PUBLISHED", publishedAt: { lte: new Date() } };
  }

  /** Slug duy nhất trong cùng loại: trùng thì thêm -2, -3... */
  private async uniqueSlug(kind: PostKind, wanted: string, excludeId?: string) {
    const base = slugify(wanted) || "bai-viet";
    for (let n = 1; n < 50; n++) {
      const slug = n === 1 ? base : `${base}-${n}`;
      if (kind === "PAGE" && RESERVED_PAGE_SLUGS.has(slug)) continue;
      const clash = await this.prisma.post.findFirst({ where: { kind, slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true } });
      if (!clash) return slug;
    }
    throw new ConflictException("Không tạo được đường dẫn duy nhất, hãy đổi tiêu đề.");
  }

  // ----- Công khai -----
  async listBlog(q: { search?: string; page: number; limit: number }) {
    const where: Prisma.PostWhereInput = {
      ...this.publishedWhere("BLOG"),
      ...(q.search ? { OR: [{ title: { contains: q.search, mode: "insensitive" } }, { excerpt: { contains: q.search, mode: "insensitive" } }] } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({ where, orderBy: { publishedAt: "desc" }, skip: (q.page - 1) * q.limit, take: q.limit, select: CARD }),
      this.prisma.post.count({ where }),
    ]);
    return { items: items.map(({ author, ...p }) => ({ ...p, authorName: author.name })), total, page: q.page, limit: q.limit };
  }

  async getPublished(kind: PostKind, slug: string) {
    const post = await this.prisma.post.findFirst({ where: { ...this.publishedWhere(kind), slug }, select: { ...CARD, body: true, updatedAt: true } });
    if (!post) throw new NotFoundException("Không tìm thấy nội dung.");
    if (kind === "BLOG") this.prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } }).catch(() => undefined);
    const { author, ...rest } = post;
    return { ...rest, authorName: author.name };
  }

  footerPages() {
    return this.prisma.post.findMany({ where: { ...this.publishedWhere("PAGE"), showInFooter: true }, orderBy: { title: "asc" }, select: { slug: true, title: true } });
  }

  // ----- Quản trị -----
  async adminList(q: { kind?: PostKind; status?: PostStatus; search?: string; page: number; limit: number }) {
    const where: Prisma.PostWhereInput = {
      ...(q.kind ? { kind: q.kind } : {}),
      ...(q.status ? { status: q.status } : {}),
      ...(q.search ? { title: { contains: q.search, mode: "insensitive" } } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.post.findMany({ where, orderBy: { updatedAt: "desc" }, skip: (q.page - 1) * q.limit, take: q.limit, select: { ...CARD, status: true, showInFooter: true, updatedAt: true } }),
      this.prisma.post.count({ where }),
    ]);
    return { items: items.map(({ author, ...p }) => ({ ...p, authorName: author.name })), total, page: q.page, limit: q.limit };
  }

  async adminGet(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException("Không tìm thấy nội dung.");
    return post;
  }

  async create(input: PostInput, authorId: string) {
    const slug = await this.uniqueSlug(input.kind, input.slug || input.title);
    return this.prisma.post.create({
      data: {
        kind: input.kind, slug, title: input.title, excerpt: input.excerpt ?? null, coverUrl: input.coverUrl ?? null, body: input.body, status: input.status,
        showInFooter: input.kind === "PAGE" && input.showInFooter,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        authorId,
      },
    });
  }

  async update(id: string, input: Partial<PostInput>) {
    const current = await this.adminGet(id);
    const kind = current.kind; // không cho đổi loại sau khi tạo (đổi sẽ làm vỡ đường dẫn đã chia sẻ)
    const data: Prisma.PostUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.excerpt !== undefined) data.excerpt = input.excerpt;
    if (input.coverUrl !== undefined) data.coverUrl = input.coverUrl;
    if (input.body !== undefined) data.body = input.body;
    if (input.showInFooter !== undefined) data.showInFooter = kind === "PAGE" && input.showInFooter;
    if (input.slug !== undefined && input.slug !== current.slug) data.slug = await this.uniqueSlug(kind, input.slug, id);
    if (input.status !== undefined) {
      data.status = input.status;
      // publishedAt là lần đăng đầu tiên: gỡ xuống rồi đăng lại không đẩy bài lên đầu danh sách
      if (input.status === "PUBLISHED" && !current.publishedAt) data.publishedAt = new Date();
    }
    return this.prisma.post.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.adminGet(id);
    await this.prisma.post.delete({ where: { id } });
    return { deleted: true };
  }
}

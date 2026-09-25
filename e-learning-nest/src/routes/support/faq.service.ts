import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { FaqItemBody } from "./support.model";

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  /** Công khai: chỉ câu hỏi đã xuất bản, bỏ danh mục rỗng. Tìm theo câu hỏi hoặc câu trả lời. */
  async listPublic(q?: string) {
    const cats = await this.prisma.faqCategory.findMany({
      orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        faqs: {
          where: {
            isPublished: true,
            ...(q ? { OR: [{ question: { contains: q, mode: "insensitive" } }, { answer: { contains: q, mode: "insensitive" } }] } : {}),
          },
          orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
          select: { id: true, question: true, answer: true },
        },
      },
    });
    return cats.filter((c) => c.faqs.length > 0);
  }

  listAdmin() {
    return this.prisma.faqCategory.findMany({
      orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
      select: { id: true, name: true, orderIndex: true, faqs: { orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }], select: { id: true, categoryId: true, question: true, answer: true, orderIndex: true, isPublished: true } } },
    });
  }

  createCategory(body: { name: string; orderIndex?: number }) {
    return this.prisma.faqCategory.create({ data: { name: body.name, orderIndex: body.orderIndex ?? 0 }, select: { id: true, name: true, orderIndex: true } });
  }

  async updateCategory(id: string, body: { name?: string; orderIndex?: number }) {
    await this.assertCategory(id);
    return this.prisma.faqCategory.update({ where: { id }, data: body, select: { id: true, name: true, orderIndex: true } });
  }

  async removeCategory(id: string) {
    await this.assertCategory(id);
    await this.prisma.faqCategory.delete({ where: { id } }); // các câu hỏi trong danh mục bị xoá theo (cascade)
    return { success: true };
  }

  async createItem(body: FaqItemBody) {
    await this.assertCategory(body.categoryId);
    return this.prisma.faq.create({
      data: { categoryId: body.categoryId, question: body.question, answer: body.answer, orderIndex: body.orderIndex ?? 0, isPublished: body.isPublished },
      select: { id: true, categoryId: true, question: true, answer: true, orderIndex: true, isPublished: true },
    });
  }

  async updateItem(id: string, body: Partial<FaqItemBody>) {
    const item = await this.prisma.faq.findUnique({ where: { id }, select: { id: true } });
    if (!item) throw new NotFoundException("Không tìm thấy câu hỏi");
    if (body.categoryId) await this.assertCategory(body.categoryId);
    return this.prisma.faq.update({ where: { id }, data: body, select: { id: true, categoryId: true, question: true, answer: true, orderIndex: true, isPublished: true } });
  }

  async removeItem(id: string) {
    const item = await this.prisma.faq.findUnique({ where: { id }, select: { id: true } });
    if (!item) throw new NotFoundException("Không tìm thấy câu hỏi");
    await this.prisma.faq.delete({ where: { id } });
    return { success: true };
  }

  async reorder(body: { categories?: { id: string; orderIndex: number }[]; items?: { id: string; orderIndex: number }[] }) {
    await this.prisma.$transaction([
      ...(body.categories ?? []).map((c) => this.prisma.faqCategory.updateMany({ where: { id: c.id }, data: { orderIndex: c.orderIndex } })),
      ...(body.items ?? []).map((i) => this.prisma.faq.updateMany({ where: { id: i.id }, data: { orderIndex: i.orderIndex } })),
    ]);
    return { success: true };
  }

  private async assertCategory(id: string) {
    const c = await this.prisma.faqCategory.findUnique({ where: { id }, select: { id: true } });
    if (!c) throw new NotFoundException("Không tìm thấy danh mục");
  }
}

import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/service/prisma.service";
import { parseCsv, toCsv } from "src/shared/helper/csv";

export const MAX_IMPORT_ROWS = 500;
export type ImportRowResult = { line: number; name: string; parent: string | null; status: "created" | "exists" | "invalid"; message?: string };

const stamp = () => new Date().toISOString().slice(0, 10);

@Injectable()
export class DataTransferService {
  constructor(private readonly prisma: PrismaService) {}

  async exportCategories() {
    const cats = await this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, isActive: true, parent: { select: { name: true } }, _count: { select: { courses: true } } },
    });
    // Cùng cột với mẫu nhập (tên, danh mục cha) để xuất ra rồi nhập lại vào hệ thống khác được
    const rows = cats.map((c) => [c.name, c.parent?.name, c.isActive ? "có" : "không", c._count.courses, c.id]);
    return { filename: `danh-muc-${stamp()}.csv`, csv: toCsv(["tên", "danh mục cha", "đang hiển thị", "số khoá học", "id"], rows), rowCount: rows.length };
  }

  importTemplate() {
    return { filename: "mau-nhap-danh-muc.csv", csv: toCsv(["tên", "danh mục cha"], [["Lập trình", ""], ["Web", "Lập trình"]]) };
  }

  /**
   * Nhập danh mục hàng loạt. Chỉ TẠO MỚI, không sửa hay xoá cái đã có (trùng thì báo `exists`), tối đa MAX_IMPORT_ROWS dòng.
   * Danh mục cha là tên đã có hoặc nằm ở dòng phía trên trong cùng file. Tối đa hai cấp, khớp với giao diện danh mục hiện tại.
   * `dryRun` chỉ kiểm tra và báo kết quả dự kiến.
   */
  async importCategories(csv: string, dryRun: boolean, actorId: string) {
    const table = parseCsv(csv);
    if (table.length < 2) throw new BadRequestException("File cần có dòng tiêu đề và ít nhất một dòng dữ liệu.");
    const header = table[0].map((h) => h.trim().toLowerCase());
    const nameIdx = header.findIndex((h) => ["tên", "ten", "name"].includes(h));
    const parentIdx = header.findIndex((h) => ["danh mục cha", "danh muc cha", "parent"].includes(h));
    if (nameIdx < 0) throw new BadRequestException("Không thấy cột 'tên' trong dòng tiêu đề.");
    const body = table.slice(1);
    if (body.length > MAX_IMPORT_ROWS) throw new BadRequestException(`Mỗi lần chỉ nhập tối đa ${MAX_IMPORT_ROWS} dòng.`);

    const existing = await this.prisma.category.findMany({ where: { deletedAt: null }, select: { id: true, name: true, parentId: true } });
    const key = (name: string, parentId: string | null) => `${parentId ?? ""}::${name.toLowerCase()}`;
    const byKey = new Map(existing.map((c) => [key(c.name, c.parentId), c.id]));
    const roots = new Map(existing.filter((c) => !c.parentId).map((c) => [c.name.toLowerCase(), c.id]));
    const nested = new Set(existing.filter((c) => c.parentId).map((c) => c.id));
    const childNames = new Set(existing.filter((c) => c.parentId).map((c) => c.name.toLowerCase()));

    const results: ImportRowResult[] = [];
    let created = 0;
    for (let i = 0; i < body.length; i++) {
      const line = i + 2;
      const name = (body[i][nameIdx] ?? "").trim();
      const parentName = parentIdx >= 0 ? (body[i][parentIdx] ?? "").trim() : "";
      const base = { line, name, parent: parentName || null };
      if (!name || name.length > 100) { results.push({ ...base, status: "invalid", message: "Tên trống hoặc dài quá 100 ký tự." }); continue; }
      let parentId: string | null = null;
      if (parentName) {
        parentId = roots.get(parentName.toLowerCase()) ?? null;
        if (!parentId && childNames.has(parentName.toLowerCase())) { results.push({ ...base, status: "invalid", message: "Chỉ hỗ trợ tối đa hai cấp danh mục." }); continue; }
        if (!parentId) { results.push({ ...base, status: "invalid", message: `Không tìm thấy danh mục cha "${parentName}" (hãy đặt nó ở dòng phía trên).` }); continue; }
        if (nested.has(parentId)) { results.push({ ...base, status: "invalid", message: "Chỉ hỗ trợ tối đa hai cấp danh mục." }); continue; }
      }
      if (byKey.has(key(name, parentId))) { results.push({ ...base, status: "exists", message: "Đã có, bỏ qua." }); continue; }
      let id = `dry-${line}`;
      if (!dryRun) {
        const row = await this.prisma.category.create({ data: { name, parentId, createdBy: actorId, updatedBy: actorId }, select: { id: true } });
        id = row.id;
      }
      byKey.set(key(name, parentId), id);
      if (!parentId) roots.set(name.toLowerCase(), id);
      else { nested.add(id); childNames.add(name.toLowerCase()); }
      created++;
      results.push({ ...base, status: "created" });
    }
    return {
      dryRun,
      total: body.length,
      created,
      existing: results.filter((r) => r.status === "exists").length,
      invalid: results.filter((r) => r.status === "invalid").length,
      results,
    };
  }
}

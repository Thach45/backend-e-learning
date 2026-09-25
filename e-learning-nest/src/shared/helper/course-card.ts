import type { Prisma } from '@prisma/client';

/** Trường tối thiểu để hiển thị một thẻ khoá học (dùng chung cho bộ sưu tập, lộ trình, hồ sơ công khai). */
export const COURSE_CARD_SELECT = {
  id: true,
  title: true,
  thumbnail: true,
  price: true,
  salePrice: true,
  level: true,
  status: true,
  instructor: { select: { id: true, name: true } },
} satisfies Prisma.CourseSelect;

export type CourseCard = {
  id: string;
  title: string;
  thumbnail: string | null;
  price: number;
  salePrice: number | null;
  level: string;
  instructor: { id: string; name: string };
};

/** Chỉ khoá đang công bố và chưa bị xoá mới được hiển thị ra ngoài. */
export const PUBLIC_COURSE_WHERE = { status: 'PUBLISHED', deletedAt: null } satisfies Prisma.CourseWhereInput;

export function toCourseCard(c: { id: string; title: string; thumbnail: string | null; price: number; salePrice: number | null; level: string; instructor: { id: string; name: string } }): CourseCard {
  return { id: c.id, title: c.title, thumbnail: c.thumbnail, price: c.price, salePrice: c.salePrice, level: c.level, instructor: c.instructor };
}

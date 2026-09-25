import { Link } from 'react-router-dom';
import { PLACEHOLDER_IMAGE } from '../../utils/placeholder';
import type { CourseCard } from '../../api/collections';

const vnd = (n: number) => (n === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n));

/** Thẻ khoá học gọn dùng cho bộ sưu tập, lộ trình và hồ sơ công khai. */
const CourseMiniCard = ({ course, children }: { course: CourseCard; children?: React.ReactNode }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col">
    <Link to={`/courses/${course.id}`}>
      <img src={course.thumbnail || PLACEHOLDER_IMAGE} alt="" loading="lazy" className="h-36 w-full object-cover" />
    </Link>
    <div className="p-4 flex-1 flex flex-col gap-1">
      <Link to={`/courses/${course.id}`} className="font-bold text-slate-900 dark:text-slate-50 hover:text-indigo-600 line-clamp-2">{course.title}</Link>
      <p className="text-xs text-slate-500">{course.instructor.name}</p>
      <p className="mt-auto pt-2 text-sm font-semibold text-indigo-600">{vnd(course.salePrice ?? course.price)}</p>
      {children}
    </div>
  </div>
);

export default CourseMiniCard;

import { useState } from 'react';
import { BarChart3, Loader2, Search, Star, ArrowUp, ArrowDown } from 'lucide-react';
import {
  useAnalyticsOverview,
  useCourseAnalytics,
  useInstructorAnalytics,
} from '../../hooks/useAdminAnalytics';
import ExportCsvButton from '../../components/admin/ExportCsvButton';

type Tab = 'overview' | 'courses' | 'instructors';

const inputCls =
  'px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500';

const Stat = ({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: 'warn' }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
    <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${tone === 'warn' ? 'text-amber-600' : 'text-slate-800 dark:text-slate-100'}`}>{value}</p>
    {hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{hint}</p>}
  </div>
);

const Loading = () => (
  <div className="flex justify-center py-12">
    <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
  </div>
);

const Rating = ({ value, count }: { value: number; count: number }) =>
  count > 0 ? (
    <span className="inline-flex items-center gap-1">
      <Star size={13} className="text-amber-500 fill-amber-500" /> {value.toFixed(1)}
      <span className="text-xs text-slate-400">({count})</span>
    </span>
  ) : (
    <span className="text-slate-400">—</span>
  );

const OverviewTab = () => {
  const { data, isLoading } = useAnalyticsOverview();
  if (isLoading || !data) return <Loading />;

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400">Cần chú ý</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Báo cáo chờ xử lý" value={data.pendingReports} tone={data.pendingReports > 0 ? 'warn' : undefined} />
          <Stat label="Khóa học chờ duyệt" value={data.pendingCourses} tone={data.pendingCourses > 0 ? 'warn' : undefined} />
          <Stat label="Câu hỏi chưa có trả lời" value={data.unansweredQuestions} hint={`trên ${data.totalQuestions} câu hỏi`} tone={data.unansweredQuestions > 0 ? 'warn' : undefined} />
          <Stat label="Khóa học đang mở bán" value={data.publishedCourses} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400">Người dùng &amp; tương tác</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Người dùng mới (7 ngày)" value={data.newUsers7d} />
          <Stat label="Học viên hoạt động (7 ngày)" value={data.activeLearners7d} />
          <Stat label="Bình luận" value={data.totalComments} />
          <Stat label="Huy hiệu đã trao" value={data.badgesAwarded} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400">Chất lượng học tập</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Điểm đánh giá TB" value={data.reviewCount ? data.avgRating.toFixed(2) : '—'} hint={`${data.reviewCount} đánh giá`} />
          <Stat label="Hài lòng TB (khảo sát)" value={data.surveyCount ? `${data.avgSatisfaction.toFixed(2)}/5` : '—'} hint={`${data.surveyCount} phản hồi`} />
          <Stat label="Tỉ lệ giới thiệu" value={data.surveyCount ? `${data.recommendRate}%` : '—'} hint="học viên muốn giới thiệu khóa học" />
          <Stat label="Tỉ lệ đạt quiz" value={data.quizAttempts ? `${data.quizPassRate}%` : '—'} hint={`${data.quizAttempts} lượt làm bài`} />
        </div>
      </section>
    </div>
  );
};

type SortableHeaderProps = {
  label: string;
  field: string;
  sortBy: string;
  order: 'asc' | 'desc';
  onSort: (field: string) => void;
};

const SortableHeader = ({ label, field, sortBy, order, onSort }: SortableHeaderProps) => (
  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase whitespace-nowrap">
    <button onClick={() => onSort(field)} className="inline-flex items-center gap-1 hover:text-indigo-600">
      {label}
      {sortBy === field && (order === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />)}
    </button>
  </th>
);

const Pager = ({ page, totalPages, total, onChange }: { page: number; totalPages: number; total: number; onChange: (p: number) => void }) => (
  <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
    <span>{total} dòng</span>
    {totalPages > 1 && (
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-50">
          Trước
        </button>
        <span>
          Trang {page} / {totalPages}
        </span>
        <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-50">
          Sau
        </button>
      </div>
    )}
  </div>
);

const CoursesTab = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('enrollments');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const { data, isLoading } = useCourseAnalytics({ page, limit: 10, search: search || undefined, sortBy, order });

  const onSort = (field: string) => {
    if (field === sortBy) setOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
    else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };
  const h = { sortBy, order, onSort };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo khóa học hoặc giảng viên..."
            className={`${inputCls} w-full pl-9`}
          />
        </div>
        <ExportCsvButton resource="course-analytics" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading || !data ? (
          <Loading />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Khóa học</th>
                    <SortableHeader label="Học viên" field="enrollments" {...h} />
                    <SortableHeader label="Hoàn thành" field="completionRate" {...h} />
                    <SortableHeader label="Đánh giá" field="rating" {...h} />
                    <SortableHeader label="Hài lòng" field="satisfaction" {...h} />
                    <SortableHeader label="Đạt quiz" field="quizPassRate" {...h} />
                    <SortableHeader label="Hỏi đáp chưa trả lời" field="unansweredQuestions" {...h} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    data.data.map((c) => (
                      <tr key={c.courseId} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors text-sm text-slate-700 dark:text-slate-200">
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">{c.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{c.instructorName}</p>
                        </td>
                        <td className="px-4 py-3">{c.enrollments}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {c.enrollments ? `${c.completionRate}%` : '—'}
                          <span className="text-xs text-slate-400"> ({c.completedLearners})</span>
                        </td>
                        <td className="px-4 py-3"><Rating value={c.avgRating} count={c.reviewCount} /></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {c.surveyCount ? `${c.avgSatisfaction.toFixed(1)}/5` : '—'}
                          {c.surveyCount ? <span className="text-xs text-slate-400"> · {c.recommendRate}% giới thiệu</span> : null}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{c.quizAttempts ? `${c.quizPassRate}%` : '—'}</td>
                        <td className={`px-4 py-3 ${c.unansweredQuestions > 0 ? 'text-amber-600 font-semibold' : ''}`}>
                          {c.unansweredQuestions}/{c.questions}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pager page={page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

const InstructorsTab = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('students');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const { data, isLoading } = useInstructorAnalytics({ page, limit: 10, search: search || undefined, sortBy, order });

  const onSort = (field: string) => {
    if (field === sortBy) setOrder((o) => (o === 'desc' ? 'asc' : 'desc'));
    else {
      setSortBy(field);
      setOrder('desc');
    }
    setPage(1);
  };
  const h = { sortBy, order, onSort };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên hoặc email..."
            className={`${inputCls} w-full pl-9`}
          />
        </div>
        <ExportCsvButton resource="instructor-analytics" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading || !data ? (
          <Loading />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-950">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Giảng viên</th>
                    <SortableHeader label="Khóa học" field="courses" {...h} />
                    <SortableHeader label="Học viên" field="students" {...h} />
                    <SortableHeader label="Đánh giá" field="rating" {...h} />
                    <SortableHeader label="Người theo dõi" field="followers" {...h} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    data.data.map((i) => (
                      <tr key={i.instructorId} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors text-sm text-slate-700 dark:text-slate-200">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{i.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{i.email}</p>
                        </td>
                        <td className="px-4 py-3">{i.courses}</td>
                        <td className="px-4 py-3">{i.students}</td>
                        <td className="px-4 py-3"><Rating value={i.avgRating} count={i.reviewCount} /></td>
                        <td className="px-4 py-3">{i.followers}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pager page={page} totalPages={data.totalPages} total={data.total} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'courses', label: 'Theo khóa học' },
  { key: 'instructors', label: 'Theo giảng viên' },
];

const AdminAnalyticsPage = () => {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <BarChart3 size={28} className="text-indigo-600" /> Báo cáo &amp; thống kê
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Chất lượng học tập và mức độ tương tác trên toàn nền tảng</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'courses' && <CoursesTab />}
      {tab === 'instructors' && <InstructorsTab />}
    </div>
  );
};

export default AdminAnalyticsPage;

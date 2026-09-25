import { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  BookOpen, 
  BarChart3, 
  Star,
  Loader2,
  ArrowUp
} from 'lucide-react';
import {
  useInstructorStats,
  useCourseAnalytics,
  useInstructorRevenueChart,
} from '../../hooks/useInstructor';
import { formatVND } from '../../utils/format';

const InstructorAnalyticsPage = () => {
  const [chartDays, setChartDays] = useState(30);

  const { data: stats, isLoading: statsLoading } = useInstructorStats();
  const { data: analyticsData, isLoading: analyticsLoading } = useCourseAnalytics();
  const { data: revenueChart, isLoading: chartLoading } = useInstructorRevenueChart({ days: chartDays });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const analytics = analyticsData?.data || [];
  const topCourses = analytics.slice(0, 3);
  const maxRevenue = revenueChart?.data && revenueChart.data.length > 0 
    ? Math.max(...revenueChart.data.map(d => d.revenue))
    : 1;

  const revenueGrowth = stats && stats.monthlyRevenue > 0 
    ? ((stats.monthlyRevenue / (stats.totalRevenue || 1)) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Thống kê & Phân tích</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Theo dõi doanh thu và hiệu suất khóa học</p>
        </div>
        <select
          value={chartDays}
          onChange={(e) => setChartDays(Number(e.target.value))}
          className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value={7}>7 ngày</option>
          <option value={30}>30 ngày</option>
          <option value={90}>90 ngày</option>
        </select>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white">
                <DollarSign size={24} />
              </div>
              <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                <ArrowUp size={14} />
                {revenueGrowth}%
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{formatVND(stats.totalRevenue)}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tổng doanh thu</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                <Users size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{formatNumber(stats.totalStudents)}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tổng học viên</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                <BookOpen size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{stats.totalCourses}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Khóa học</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                <TrendingUp size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Đánh giá TB ({stats.totalReviews})</p>
          </div>
        </div>
      ) : null}

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Doanh thu theo thời gian</h2>
          <BarChart3 size={20} className="text-slate-400 dark:text-slate-500" />
        </div>
        {chartLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-purple-600" size={24} />
          </div>
        ) : revenueChart && revenueChart.data.length > 0 ? (
          <div className="space-y-4">
            {revenueChart.data
              .filter((_, idx) => idx % Math.ceil(revenueChart.data.length / 10) === 0)
              .map((data, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {new Date(data.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-8 relative overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full flex items-center justify-end pr-3 transition-all"
                      style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                    >
                      {data.revenue > 0 && (
                        <span className="text-xs font-bold text-white">{formatVND(data.revenue)}</span>
                      )}
                    </div>
                  </div>
                  <div className="w-20 text-xs text-slate-500 dark:text-slate-400 text-right">
                    {data.enrollments} ghi danh
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            Chưa có dữ liệu doanh thu
          </div>
        )}
      </div>

      {/* Top Courses */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Khóa học bán chạy nhất</h2>
        </div>
        {analyticsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-purple-600" size={24} />
          </div>
        ) : topCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Khóa học</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Học viên</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Doanh thu</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase">Đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topCourses.map((course) => (
                  <tr key={course.courseId} className="hover:bg-slate-50 dark:bg-slate-950 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{course.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{course.enrollments.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-100">{formatVND(course.revenue)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {course.averageRating > 0 ? (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{course.averageRating.toFixed(1)}</span>
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Chưa có</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            Chưa có khóa học nào
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorAnalyticsPage;

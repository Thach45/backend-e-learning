import { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  ShoppingCart, 
  GraduationCap, 
  TrendingUp, 
  DollarSign,
  FileText,
  Eye,
  Download,
  Heart,
  Loader2,
  ArrowUp,
  ArrowDown,
  Tag
} from 'lucide-react';
import {
  useOverviewStats,
  useRevenueStats,
  useUserStats,
  useCourseStats,
  useDocumentStats,
  useRevenueChartData,
  useUserChartData,
} from '../../hooks/useDashboard';

const AdminDashboard = () => {
  const [chartDays, setChartDays] = useState(30);

  const { data: overview, isLoading: overviewLoading } = useOverviewStats();
  const { data: revenue, isLoading: revenueLoading } = useRevenueStats();
  const { data: userStats, isLoading: userStatsLoading } = useUserStats();
  const { data: courseStats, isLoading: courseStatsLoading } = useCourseStats();
  const { data: documentStats, isLoading: documentStatsLoading } = useDocumentStats();
  const { data: revenueChart, isLoading: revenueChartLoading } = useRevenueChartData(chartDays);
  const { data: userChart, isLoading: userChartLoading } = useUserChartData(chartDays);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const isLoading = overviewLoading || revenueLoading;

  const stats = overview ? [
    { 
      label: 'Tổng người dùng', 
      value: formatNumber(overview.totalUsers),
      change: userStats ? `${userStats.userGrowth >= 0 ? '+' : ''}${userStats.userGrowth.toFixed(1)}%` : '0%',
      icon: Users, 
      color: 'bg-blue-500',
      trend: userStats?.userGrowth || 0,
    },
    { 
      label: 'Khóa học', 
      value: formatNumber(overview.totalCourses),
      change: `${overview.publishedCourses} đã xuất bản`,
      icon: BookOpen, 
      color: 'bg-purple-500',
    },
    { 
      label: 'Tài liệu', 
      value: formatNumber(overview.totalDocuments),
      change: `${overview.verifiedDocuments} đã xác nhận`,
      icon: FileText, 
      color: 'bg-indigo-500',
    },
    { 
      label: 'Đơn hàng', 
      value: formatNumber(overview.totalOrders),
      change: `${overview.pendingOrders} đang chờ`,
      icon: ShoppingCart, 
      color: 'bg-emerald-500',
    },
    { 
      label: 'Ghi danh', 
      value: courseStats ? formatNumber(courseStats.totalEnrollments) : '0',
      change: courseStats ? `Rating: ${courseStats.averageRating.toFixed(1)}/5` : '',
      icon: GraduationCap, 
      color: 'bg-amber-500',
    },
    { 
      label: 'Doanh thu', 
      value: formatVND(overview.totalRevenue),
      change: revenue ? `${revenue.revenueGrowth >= 0 ? '+' : ''}${revenue.revenueGrowth.toFixed(1)}%` : '0%',
      icon: DollarSign, 
      color: 'bg-rose-500',
      trend: revenue?.revenueGrowth || 0,
    },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Tổng quan hệ thống E-Learning</p>
        </div>
        <select
          value={chartDays}
          onChange={(e) => setChartDays(Number(e.target.value))}
          className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value={7}>7 ngày</option>
          <option value={30}>30 ngày</option>
          <option value={90}>90 ngày</option>
        </select>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isPositive = (stat.trend || 0) >= 0;
            return (
              <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                    <Icon size={24} />
                  </div>
                  {stat.trend !== undefined && (
                    <span className={`text-sm font-semibold flex items-center gap-1 ${
                      isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      {stat.change}
                    </span>
                  )}
                  {stat.trend === undefined && stat.change && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">{stat.change}</span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Revenue & User Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Doanh thu</h2>
          </div>
          {revenueLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
            </div>
          ) : revenue ? (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Hôm nay</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatVND(revenue.dailyRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tuần này</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatVND(revenue.weeklyRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tháng này</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatVND(revenue.monthlyRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tổng cộng</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatVND(revenue.totalRevenue)}</p>
                </div>
              </div>
              {revenue.topCourses.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Top khóa học</p>
                  <div className="space-y-2">
                    {revenue.topCourses.map((course, idx) => (
                      <div key={course.courseId} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">{idx + 1}. {course.courseTitle}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{formatVND(course.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* User Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Người dùng</h2>
          </div>
          {userStatsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
            </div>
          ) : userStats ? (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Hôm nay</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{userStats.newUsersToday}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tuần này</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{userStats.newUsersThisWeek}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tháng này</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{userStats.newUsersThisMonth}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Đang hoạt động</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{userStats.activeUsers}</p>
                </div>
              </div>
              {userStats.usersByRole.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Theo vai trò</p>
                  <div className="space-y-2">
                    {userStats.usersByRole.map((role) => (
                      <div key={role.roleName} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">{role.roleName}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{role.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Course & Document Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Khóa học</h2>
          </div>
          {courseStatsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
            </div>
          ) : courseStats ? (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tổng</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{courseStats.totalCourses}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Đã xuất bản</p>
                  <p className="text-lg font-bold text-emerald-600">{courseStats.publishedCourses}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Bản nháp</p>
                  <p className="text-lg font-bold text-slate-600 dark:text-slate-300">{courseStats.draftCourses}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Ghi danh</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatNumber(courseStats.totalEnrollments)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Đánh giá trung bình</p>
                  <p className="text-lg font-bold text-amber-600">{courseStats.averageRating.toFixed(1)}/5</p>
                </div>
              </div>
              {courseStats.topCourses.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Top khóa học</p>
                  <div className="space-y-2">
                    {courseStats.topCourses.map((course, idx) => (
                      <div key={course.courseId} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300 truncate flex-1">{idx + 1}. {course.title}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 ml-2">{course.enrollments} học viên</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Document Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Tài liệu cộng đồng</h2>
          </div>
          {documentStatsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
            </div>
          ) : documentStats ? (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tổng tài liệu</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatNumber(documentStats.totalDocuments)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Đã xác nhận</p>
                  <p className="text-lg font-bold text-emerald-600">{formatNumber(documentStats.verifiedDocuments)}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye size={16} className="text-slate-400 dark:text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300">{formatNumber(documentStats.totalViews)} lượt xem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download size={16} className="text-slate-400 dark:text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300">{formatNumber(documentStats.totalDownloads)} lượt tải</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-slate-400 dark:text-slate-500" />
                    <span className="text-slate-600 dark:text-slate-300">{formatNumber(documentStats.totalLikes)} lượt thích</span>
                  </div>
                </div>
              </div>
              {documentStats.topTags.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <Tag size={16} /> Top từ khóa
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {documentStats.topTags.map((tag) => (
                      <span
                        key={tag.tagId}
                        className="px-3 py-1 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                        }}
                      >
                        {tag.tagName} ({tag.documentCount})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Biểu đồ doanh thu</h2>
          </div>
          {revenueChartLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
            </div>
          ) : revenueChart ? (
            <div className="p-6">
              <div className="h-64 flex items-end justify-between gap-1">
                {revenueChart.data.map((point, idx) => {
                  const maxValue = Math.max(...revenueChart.data.map(p => p.value));
                  const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-600"
                        style={{ height: `${height}%` }}
                        title={`${point.date}: ${formatVND(point.value)}`}
                      />
                      {idx % Math.ceil(revenueChart.data.length / 7) === 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 transform -rotate-45 origin-left">
                          {new Date(point.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* User Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Biểu đồ người dùng mới</h2>
          </div>
          {userChartLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
            </div>
          ) : userChart ? (
            <div className="p-6">
              <div className="h-64 flex items-end justify-between gap-1">
                {userChart.data.map((point, idx) => {
                  const maxValue = Math.max(...userChart.data.map(p => p.value));
                  const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{ height: `${height}%` }}
                        title={`${point.date}: ${point.value} người`}
                      />
                      {idx % Math.ceil(userChart.data.length / 7) === 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 transform -rotate-45 origin-left">
                          {new Date(point.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

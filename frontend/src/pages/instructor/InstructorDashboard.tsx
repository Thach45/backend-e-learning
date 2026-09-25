import { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Loader2,
  BarChart3,
  ArrowUp,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  useInstructorStats,
  useInstructorRevenueChart,
} from '../../hooks/useInstructor';
import { formatVND } from '../../utils/format';

const InstructorDashboard = () => {
  const [dateRange, setDateRange] = useState<'preset' | 'custom'>('preset');
  const [presetDays, setPresetDays] = useState(30);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { data: stats, isLoading: statsLoading } = useInstructorStats();
  const chartParams = dateRange === 'preset' 
    ? { days: presetDays }
    : { startDate, endDate };
  const { data: revenueChart, isLoading: chartLoading } = useInstructorRevenueChart(chartParams);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const isLoading = statsLoading;

  const dashboardStats = stats ? [
    { 
      label: 'Tổng khóa học', 
      value: formatNumber(stats.totalCourses),
      change: `${stats.publishedCourses} đã xuất bản`,
      icon: BookOpen, 
      color: 'bg-purple-500' 
    },
    { 
      label: 'Tổng học viên', 
      value: formatNumber(stats.totalStudents),
      change: `${stats.totalEnrollments} ghi danh`,
      icon: Users, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Doanh thu', 
      value: formatVND(stats.totalRevenue),
      change: `Tháng này: ${formatVND(stats.monthlyRevenue)}`,
      icon: DollarSign, 
      color: 'bg-emerald-500' 
    },
    { 
      label: 'Đánh giá trung bình', 
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0',
      change: `${stats.totalReviews} đánh giá`,
      icon: Star, 
      color: 'bg-amber-500' 
    },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Dashboard Giảng viên</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Tổng quan khóa học và học viên của bạn</p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                    <Icon size={24} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{stat.change}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 size={24} className="text-purple-600" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Doanh thu & Ghi danh</h2>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-slate-400 dark:text-slate-500" />
            <div className="flex items-center gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'preset' | 'custom')}
                className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-900"
              >
                <option value="preset">Khoảng thời gian</option>
                <option value="custom">Tùy chọn</option>
              </select>
              {dateRange === 'preset' ? (
                <select
                  value={presetDays}
                  onChange={(e) => setPresetDays(Number(e.target.value))}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-900"
                >
                  <option value={7}>7 ngày</option>
                  <option value={30}>30 ngày</option>
                  <option value={90}>90 ngày</option>
                  <option value={180}>6 tháng</option>
                  <option value={365}>1 năm</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={endDate}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-900"
                  />
                  <span className="text-slate-500 dark:text-slate-400">đến</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    max={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-900"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {chartLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-purple-600" size={24} />
          </div>
        ) : revenueChart && revenueChart.data.length > 0 ? (
          <div className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={revenueChart.data.map(d => ({
                  ...d,
                  dateLabel: new Date(d.date).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: revenueChart.data.length <= 30 ? '2-digit' : 'short',
                  }),
                }))}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="dateLabel" 
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="revenue"
                  orientation="left"
                  stroke="#8b5cf6"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => formatVND(value)}
                />
                <YAxis 
                  yAxisId="enrollments"
                  orientation="right"
                  stroke="#3b82f6"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                  formatter={(value, name) => {
                    const v = typeof value === 'number' ? value : 0;
                    if (name === 'revenue') {
                      return [formatVND(v), 'Doanh thu'];
                    }
                    return [v, 'Ghi danh'];
                  }}
                  labelFormatter={(label) => `Ngày: ${label}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => {
                    if (value === 'revenue') return 'Doanh thu';
                    if (value === 'enrollments') return 'Ghi danh';
                    return value;
                  }}
                />
                <Area
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="revenue"
                />
                <Area
                  yAxisId="enrollments"
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEnrollments)"
                  name="enrollments"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span>Tổng doanh thu: <strong className="text-slate-800 dark:text-slate-100">{formatVND(revenueChart.data.reduce((sum, d) => sum + d.revenue, 0))}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Tổng ghi danh: <strong className="text-slate-800 dark:text-slate-100">{revenueChart.data.reduce((sum, d) => sum + d.enrollments, 0).toLocaleString()}</strong></span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <BarChart3 className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-500 dark:text-slate-400">Chưa có dữ liệu trong khoảng thời gian này</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700">Doanh thu trung bình/ngày</span>
              <DollarSign size={20} className="text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {revenueChart && revenueChart.data.length > 0
                ? formatVND(
                    revenueChart.data.reduce((sum, d) => sum + d.revenue, 0) / revenueChart.data.length
                  )
                : formatVND(0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">Ghi danh trung bình/ngày</span>
              <Users size={20} className="text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {revenueChart && revenueChart.data.length > 0
                ? Math.round(
                    revenueChart.data.reduce((sum, d) => sum + d.enrollments, 0) / revenueChart.data.length
                  )
                : 0}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emerald-700">Tỷ lệ tăng trưởng</span>
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-900">
              {revenueChart && revenueChart.data.length > 1
                ? (() => {
                    const firstHalf = revenueChart.data.slice(0, Math.floor(revenueChart.data.length / 2));
                    const secondHalf = revenueChart.data.slice(Math.floor(revenueChart.data.length / 2));
                    const firstAvg = firstHalf.reduce((sum, d) => sum + d.revenue, 0) / firstHalf.length;
                    const secondAvg = secondHalf.reduce((sum, d) => sum + d.revenue, 0) / secondHalf.length;
                    const growth = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
                    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
                  })()
                : '0%'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;

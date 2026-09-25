import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FolderTree, 
  ShoppingCart, 
  GraduationCap,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut,
  Shield,
  FileText,
  ScrollText,
  Flag,
  Ticket,
  BarChart3,
  Tags,
  Mail,
  Headset,
  HelpCircle,
  Activity
} from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';
import { usePendingReportCount } from '../hooks/useModeration';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: pendingReports } = usePendingReportCount();

  const menuItems = [
    // { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Người dùng', path: '/admin/users' },
    { icon: BookOpen, label: 'Khóa học', path: '/admin/courses' },
    { icon: FolderTree, label: 'Danh mục', path: '/admin/categories' },
    { icon: ShoppingCart, label: 'Đơn hàng', path: '/admin/orders' },
    { icon: Ticket, label: 'Mã giảm giá', path: '/admin/coupons' },
    { icon: GraduationCap, label: 'Ghi danh', path: '/admin/enrollments' },
    { icon: MessageSquare, label: 'Đánh giá', path: '/admin/reviews' },
    { icon: Flag, label: 'Kiểm duyệt', path: '/admin/moderation', badge: pendingReports?.pending },
    { icon: FileText, label: 'Tài liệu', path: '/admin/documents' },
    { icon: BarChart3, label: 'Báo cáo & thống kê', path: '/admin/analytics' },
    { icon: Shield, label: 'Phân quyền', path: '/admin/permissions' },
    { icon: ScrollText, label: 'Nhật ký', path: '/admin/audit-logs' },
    { icon: Mail, label: 'Email', path: '/admin/email-campaigns' },
    { icon: Headset, label: 'Hỗ trợ', path: '/admin/support' },
    { icon: HelpCircle, label: 'FAQ', path: '/admin/faq' },
    { icon: Tags, label: 'Thẻ kỹ năng', path: '/admin/tags' },
    { icon: Activity, label: 'Hệ thống', path: '/admin/system' },
    { icon: Settings, label: 'Cài đặt', path: '/admin/settings' },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/admin' && location.pathname.startsWith(`${path}/`));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img src="/assets/image.png" alt="U Đê Mê" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-200" />
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Admin Panel</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">U Đê Mê Platform</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 hover:text-indigo-600'
                }`}
              >
                <Icon size={20} />
                {item.label}
                {'badge' in item && !!item.badge && (
                  <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" 
              alt="Admin" 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" 
            />
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">Admin User</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">admin@example.com</p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 w-full py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-50 dark:bg-slate-950">
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="md:ml-64 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 rounded-lg"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggle />
            <Link
              to="/"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;


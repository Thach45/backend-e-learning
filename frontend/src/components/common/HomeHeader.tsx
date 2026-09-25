import { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, ShoppingCart, ChevronDown, Receipt, LogOut, User, Settings, BookOpen, Heart, ClipboardList, LifeBuoy, Bookmark, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';
import { useAuthStatus } from '../../hooks/useAuthStatus';
import { useLogout } from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';

type HeaderProps = {
  cartCount?: number;
};

const HomeHeader = ({ cartCount = 0 }: HeaderProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated } = useAuthStatus();
  const unreadMessages = useUnreadMessages();
  const logoutMutation = useLogout();

  // Check if current route matches
  const isActive = (path: string) => {
    if (path === '/courses') {
      return location.pathname === '/courses' || location.pathname.startsWith('/courses/');
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-8">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            <img src="/assets/image.png" alt="U Đê Mê" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-indigo-200" />
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight hidden sm:block">U Đê Mê</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link 
              to="/courses" 
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                isActive('/courses')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:bg-slate-950'
              }`}
            >
              Khám phá
            </Link>
            <Link 
              to="/my-courses" 
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                isActive('/my-courses')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:bg-slate-950'
              }`}
            >
              Khóa học của tôi
            </Link>
            <a 
              href="/community" 
              className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:bg-slate-950 rounded-full transition-colors"
            >
              Cộng đồng
            </a>
            <Link
              to="/paths"
              className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:bg-slate-950 rounded-full transition-colors"
            >
              Lộ trình
            </Link>
            <Link
              to="/blog"
              className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:bg-slate-950 rounded-full transition-colors"
            >
              Blog
            </Link>
          </nav>

          <div className="hidden lg:flex flex-1 max-w-md relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:bg-white dark:bg-slate-900 transition-all outline-none placeholder:text-slate-400 dark:text-slate-500"
            />
          </div>

          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            {isAuthenticated && (
              <Link to="/messages" aria-label="Tin nhắn" className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-colors">
                <MessageSquare size={20} />
                {unreadMessages > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">{unreadMessages > 9 ? '9+' : unreadMessages}</span>}
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <Heart size={20} />
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/cart"
                className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-5 px-1 bg-amber-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated && <NotificationBell />}

            <ThemeToggle />

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img 
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'} 
                    alt={user.name} 
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800" 
                  />
                  <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 hidden xl:block transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'} 
                          alt={user.name} 
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                          {user.roles && user.roles.length > 0 && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                              {user.roles[0] === 'ADMIN' ? 'Quản trị viên' : 
                               user.roles[0] === 'INSTRUCTOR' ? 'Giảng viên' : 'Học viên'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/my-courses"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors text-slate-700 dark:text-slate-200"
                      >
                        <BookOpen size={18} className="text-indigo-600" />
                        <span className="font-medium">Khóa học của tôi</span>
                      </Link>
                      <Link
                        to="/my-assignments"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors text-slate-700 dark:text-slate-200"
                      >
                        <ClipboardList size={18} className="text-indigo-600" />
                        <span className="font-medium">Bài tập của tôi</span>
                      </Link>
                      <Link
                        to="/support/tickets"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors text-slate-700 dark:text-slate-200"
                      >
                        <LifeBuoy size={18} className="text-indigo-600" />
                        <span className="font-medium">Yêu cầu hỗ trợ</span>
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors text-slate-700 dark:text-slate-200"
                      >
                        <Receipt size={18} className="text-indigo-600" />
                        <span className="font-medium">Đơn hàng của tôi</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors text-slate-700 dark:text-slate-200"
                      >
                        <Heart size={18} className="text-indigo-600" />
                        <span className="font-medium">Danh sách yêu thích</span>
                      </Link>
                      <Link
                        to="/collections"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors text-slate-700 dark:text-slate-200"
                      >
                        <Bookmark size={18} className="text-indigo-600" />
                        <span className="font-medium">Bộ sưu tập của tôi</span>
                      </Link>
                      <Link
                        to="/account/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors text-slate-700 dark:text-slate-200"
                      >
                        <Settings size={18} className="text-indigo-600" />
                        <span className="font-medium">Cài đặt tài khoản</span>
                      </Link>
                      {user.roles?.includes('ADMIN') && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors text-slate-700 dark:text-slate-200"
                        >
                          <Settings size={18} className="text-indigo-600" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      )}
                      {user.roles?.includes('INSTRUCTOR') && (
                        <Link
                          to="/instructor"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:bg-slate-950 transition-colors text-slate-700 dark:text-slate-200"
                        >
                          <User size={18} className="text-indigo-600" />
                          <span className="font-medium">Instructor Dashboard</span>
                        </Link>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 dark:border-slate-800"></div>

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 transition-colors text-rose-600 font-medium disabled:opacity-50"
                    >
                      <LogOut size={18} />
                      <span>{logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors text-sm"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom info strip */}
      <div className="hidden mb-2 mt-2 md:block border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-4 flex-wrap">
            
            <span className="hidden lg:inline text-slate-500 dark:text-slate-400">Hỗ trợ 24/7</span>
            <span className="hidden lg:inline text-slate-500 dark:text-slate-400">Hoàn tiền trong 7 ngày</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/account/orders" className="hover:text-indigo-600 flex items-center gap-1">
              <Receipt size={14} className="text-indigo-600" />
              <span>Đơn hàng đã mua</span>
            </a>
            <Link to="/help" className="hover:text-indigo-600">Trợ giúp</Link>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 absolute w-full left-0 shadow-xl z-50">
          <div className="p-4 space-y-4">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm outline-none"
            />
            <div className="flex flex-col gap-2">
              <Link 
                to="/courses" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-2 font-semibold rounded-lg transition-colors ${
                  isActive('/courses')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950'
                }`}
              >
                Khám phá
              </Link>
              <Link 
                to="/my-courses" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-2 font-semibold rounded-lg transition-colors ${
                  isActive('/my-courses')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950'
                }`}
              >
                Khóa học của tôi
              </Link>
              <a 
                href="/community" 
                className="p-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 rounded-lg"
              >
                Cộng đồng
              </a>
              <Link to="/paths" className="p-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 rounded-lg">
                Lộ trình
              </Link>
              <Link to="/blog" className="p-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 rounded-lg">
                Blog
              </Link>
            </div>
            {isAuthenticated && user ? (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                  <img 
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full object-cover" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to="/my-courses" className="p-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm">Khóa học của tôi</Link>
                  <Link to="/my-assignments" className="p-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm">Bài tập của tôi</Link>
                  <Link to="/support/tickets" className="p-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm">Yêu cầu hỗ trợ</Link>
                  <Link to="/account/orders" className="p-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm">Đơn hàng của tôi</Link>
                  <Link to="/wishlist" className="p-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm">Danh sách yêu thích</Link>
                  <Link to="/notifications" className="p-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm">Thông báo</Link>
                  <Link to="/account/settings" className="p-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm">Cài đặt tài khoản</Link>
                  {user.roles?.includes('ADMIN') && (
                    <Link to="/admin" className="p-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm">Admin Panel</Link>
                  )}
                  {user.roles?.includes('INSTRUCTOR') && (
                    <Link to="/instructor" className="p-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-950 rounded-lg text-sm">Instructor Dashboard</Link>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full mt-3 p-2 text-xs text-red-500 font-semibold hover:bg-rose-50 rounded-lg disabled:opacity-50"
                >
                  {logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/auth/login"
                  className="block w-full p-2 text-center bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors text-sm"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default HomeHeader;


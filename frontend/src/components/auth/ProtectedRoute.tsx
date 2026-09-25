import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStatus, type UserRole } from '../../hooks/useAuthStatus';
import { Loader2 } from 'lucide-react';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAnyRole?: boolean; // true = chỉ cần 1 trong các role, false = cần tất cả
  redirectTo?: string;
};

const ProtectedRoute = ({
  children,
  requiredRoles,
  requireAnyRole = true,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading, jwtPayload } = useAuthStatus();

  // Not authenticated - check từ JWT payload (nhanh, không cần chờ API)
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Loading state - chỉ show khi đang fetch API /auth/me lần đầu
  // Nhưng vẫn có thể check role từ JWT payload
  if (isLoading && !jwtPayload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  // Một tài khoản có thể có nhiều vai trò (ví dụ ADMIN + INSTRUCTOR) nhưng JWT chỉ mang một vai trò chính.
  // Nên gộp vai trò trong JWT với toàn bộ vai trò từ API /auth/me để không chặn nhầm người có đủ quyền.
  if (requiredRoles && requiredRoles.length > 0) {
    const jwtRole = jwtPayload?.roleName;
    const owned = new Set<UserRole>([...(jwtRole ? [jwtRole] : []), ...(user?.roles ?? [])]);
    const satisfied = requireAnyRole
      ? requiredRoles.some((r) => owned.has(r))
      : requiredRoles.every((r) => owned.has(r));

    // Vai trò chính trong JWT chưa đủ mà danh sách vai trò đầy đủ còn đang tải thì chờ, tránh báo "không có quyền" nhầm rồi nháy lại
    if (!satisfied && isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      );
    }

    if (!satisfied) {
      const mainRole = jwtRole ?? user?.roles?.[0];
      const defaultRedirect = mainRole === 'ADMIN' ? '/admin' : mainRole === 'INSTRUCTOR' ? '/instructor' : '/';

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-md">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Không có quyền truy cập</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Bạn không có quyền truy cập trang này.
            </p>
            <a
              href={defaultRedirect}
              className="inline-block px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
            >
              Về trang chủ
            </a>
          </div>
        </div>
      );
    }
  }

  // Check user status từ API (nếu đã có user data)
  if (user && user.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-md">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Tài khoản bị khóa</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Tài khoản của bạn đang ở trạng thái {user.status === 'INACTIVE' ? 'không hoạt động' : 'bị khóa'}.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;


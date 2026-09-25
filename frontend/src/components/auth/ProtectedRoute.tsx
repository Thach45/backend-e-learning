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
  const { isAuthenticated, user, isLoading, hasRole, hasAnyRole, jwtPayload } = useAuthStatus();

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

  // Check roles từ JWT payload trước (nhanh, không cần chờ API)
  if (requiredRoles && requiredRoles.length > 0 && jwtPayload) {
    const jwtRole = jwtPayload.roleName;
    const hasRequiredRole = requireAnyRole
      ? requiredRoles.includes(jwtRole)
      : requiredRoles.every(role => role === jwtRole);

    if (!hasRequiredRole) {
      // Redirect based on JWT role
      let defaultRedirect = '/';
      if (jwtRole === 'ADMIN') {
        defaultRedirect = '/admin';
      } else if (jwtRole === 'INSTRUCTOR') {
        defaultRedirect = '/instructor';
      }

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

  // Fallback: Check roles từ API nếu chưa check từ JWT (trường hợp hiếm)
  if (requiredRoles && requiredRoles.length > 0 && !jwtPayload) {
    const hasRequiredRole = requireAnyRole
      ? hasAnyRole(requiredRoles)
      : requiredRoles.every(role => hasRole(role));

    if (!hasRequiredRole) {
      // Redirect based on user's role
      const userRole = user?.roles?.[0];
      let defaultRedirect = '/';
      
      if (userRole === 'ADMIN') {
        defaultRedirect = '/admin';
      } else if (userRole === 'INSTRUCTOR') {
        defaultRedirect = '/instructor';
      }

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

  return <>{children}</>;
};

export default ProtectedRoute;


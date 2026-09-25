import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { authApi } from '../api/auth';
import { getJWTPayload, isTokenExpired } from '../utils/jwt';

export type UserRole = 'ADMIN' | 'CLIENT' | 'INSTRUCTOR';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  avatar: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  roles: UserRole[];
};

// Get current user info
export const useAuthStatus = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = Cookies.get('refreshToken');
  
  // Decode JWT để lấy thông tin cơ bản ngay lập tức (không cần chờ API)
  const jwtPayload = getJWTPayload();
  const isTokenValid = jwtPayload !== null && !isTokenExpired(accessToken);
  const isAuthenticated = !!(accessToken && refreshToken && isTokenValid);

  // Lấy role từ JWT payload (nhanh, không cần chờ API)
  const jwtRole = jwtPayload?.roleName as UserRole | undefined;
  const userId = jwtPayload?.userId;

  // Gọi API /auth/me để lấy thông tin đầy đủ, cache với staleTime: Infinity
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const data = await authApi.getMe();
      return {
        ...data,
        roles: (data.roles || []) as UserRole[],
      };
    },
    enabled: isAuthenticated, // Chỉ fetch khi đã có token và token hợp lệ
    retry: false,
    staleTime: Infinity, // Cache vĩnh viễn - không bao giờ stale
    gcTime: Infinity, // Giữ cache vĩnh viễn trong memory
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false, // Không refetch khi reconnect
  });

  // Dùng role từ JWT payload nếu có, fallback về user.roles từ API
  const roles = user?.roles || (jwtRole ? [jwtRole] : []);

  const hasRole = (role: UserRole) => {
    // Ưu tiên dùng JWT payload (nhanh hơn)
    if (jwtRole === role) return true;
    // Fallback về user.roles từ API
    return roles.includes(role);
  };

  const hasAnyRole = (requiredRoles: UserRole[]) => {
    // Ưu tiên dùng JWT payload
    if (jwtRole && requiredRoles.includes(jwtRole)) return true;
    // Fallback về user.roles từ API
    return requiredRoles.some(role => roles.includes(role));
  };

  return {
    isAuthenticated,
    user: user || (jwtPayload ? {
      id: userId || '',
      email: '',
      name: '',
      phoneNumber: '',
      avatar: null,
      status: 'ACTIVE' as const,
      roles: jwtRole ? [jwtRole] : [],
    } : undefined),
    isLoading,
    error,
    hasRole,
    hasAnyRole,
    jwtPayload, // Expose JWT payload để dùng ở nơi khác nếu cần
  };
};


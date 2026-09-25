import { jwtDecode } from 'jwt-decode';

export type JWTPayload = {
  userId: string;
  deviceId: string;
  roleId: string;
  roleName: 'ADMIN' | 'CLIENT' | 'INSTRUCTOR';
  uuid: string;
  iat: number;
  exp: number;
};

/**
 * Decode JWT token và trả về payload
 * @param token - JWT token string
 * @returns Decoded payload hoặc null nếu invalid
 */
export const decodeJWT = (token: string | null): JWTPayload | null => {
  if (!token) return null;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return null; // Token expired
    }

    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Lấy JWT payload từ localStorage
 */
export const getJWTPayload = (): JWTPayload | null => {
  const accessToken = localStorage.getItem('accessToken');
  return decodeJWT(accessToken);
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string | null): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};


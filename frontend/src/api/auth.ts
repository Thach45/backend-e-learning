import apiClient from './axios';
import Cookies from 'js-cookie';

// Types
export type RegisterBody = {
  email: string;
  name: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  otp: string;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type SendOtpBody = {
  email: string;
  type: 'REGISTER' | 'FORGOT_PASSWORD';
};

export type ForgotPasswordBody = {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
};

export type ChangePasswordBody = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type UpdateProfileBody = {
  name?: string;
  phoneNumber?: string;
  avatar?: string | null;
};

export type DeviceItem = {
  id: string;
  userAgent: string;
  ipAddress: string;
  lastActiveAt: string;
  isActive: boolean;
  isCurrent: boolean;
};

export type RefreshTokenBody = {
  refreshToken: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type UserResponse = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  avatar: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
};

export type UserWithRolesResponse = UserResponse & {
  roles: ('ADMIN' | 'CLIENT' | 'INSTRUCTOR')[];
};

export type GoogleLinkResponse = {
  data: {
    link: string;
  };
};

// Auth API functions
export const authApi = {
  // Send OTP
  sendOtp: async (body: SendOtpBody) => {
    const response = await apiClient.post('/auth/send-otp', body);
    return response.data;
  },

  // Register
  register: async (body: RegisterBody): Promise<UserResponse> => {
    const response = await apiClient.post('/auth/register', body);
    return response.data;
  },

  // Login
  // Axios tự động gửi body dưới dạng JSON (Content-Type: application/json)
  // Không cần JSON.stringify() - axios làm điều đó tự động
  login: async (body: LoginBody): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', body);
    const { accessToken, refreshToken } = response.data.data;

    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    Cookies.set('refreshToken', refreshToken, {
      expires: 7, // 7 days
      secure: true,
      sameSite: 'strict',
    });
    
    return response.data;
  },

  // Refresh Token
  refreshToken: async (body: RefreshTokenBody): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/refresh-token', body);
    const { accessToken, refreshToken } = response.data;
    
    // Update tokens
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      Cookies.set('refreshToken', refreshToken, {
        expires: 7,
        secure: true,
        sameSite: 'strict',
      });
    }
    
    return response.data;
  },

  // Logout
  logout: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    
    // Clear tokens
    localStorage.removeItem('accessToken');
    Cookies.remove('refreshToken');
    
    return response.data;
  },

  // Forgot Password
  forgotPassword: async (body: ForgotPasswordBody) => {
    const response = await apiClient.post('/auth/forgot-password', body);
    return response.data;
  },

  // Get Google OAuth Link
  getGoogleLink: async (): Promise<GoogleLinkResponse> => {
    const response = await apiClient.get('/auth/google-link');
    return response.data;
  },

  // Exchange one-time code (from Google OAuth redirect) for real tokens
  exchangeGoogleCode: async (code: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/google/exchange', { code });
    return response.data.data;
  },

  // Get current user info
  getMe: async (): Promise<UserWithRolesResponse> => {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },

  // Change password (logged-in user)
  changePassword: async (body: ChangePasswordBody): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/change-password', body);
    return response.data.data;
  },

  // Update own profile (name, phoneNumber, avatar)
  updateProfile: async (body: UpdateProfileBody): Promise<UserResponse> => {
    const response = await apiClient.patch('/auth/me', body);
    return response.data.data;
  },

  // List active login sessions/devices
  getDevices: async (): Promise<{ data: DeviceItem[] }> => {
    const response = await apiClient.get('/auth/devices');
    return response.data.data;
  },

  // Revoke a login session/device
  revokeDevice: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/auth/devices/${id}`);
    return response.data.data;
  },
};


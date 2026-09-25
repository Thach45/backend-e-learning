import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { authApi, type LoginBody, type RegisterBody, type SendOtpBody, type ForgotPasswordBody, type ChangePasswordBody, type UpdateProfileBody } from '../api/auth';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Send OTP Mutation
export const useSendOtp = () => {
  return useMutation({
    mutationFn: (body: SendOtpBody) => authApi.sendOtp(body),
    onSuccess: () => {
      toast.success('Đã gửi mã OTP.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể gửi OTP.'));
    },
  });
};

// Register Mutation
export const useRegister = () => {
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (body: RegisterBody) => authApi.register(body),
    onSuccess: () => {
      toast.success('Đăng ký thành công. Vui lòng đăng nhập.');
      navigate('/auth/login?registered=true');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Đăng ký thất bại.'));
    },
  });
};

// Login Mutation
export const useLogin = (redirectTo?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (body: LoginBody) => authApi.login(body),
    onSuccess: async () => {
      // Invalidate và refetch user info sau khi login
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Đăng nhập thành công.');
      navigate(redirectTo || '/');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Đăng nhập thất bại.'));
    },
  });
};

// Logout Mutation
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => {
      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }
      return authApi.logout(refreshToken);
    },
    onSuccess: () => {
      // Remove auth/me cache khi logout
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      queryClient.clear();
      toast.success('Đăng xuất thành công.');
      navigate('/auth/login');
    },
    onError: () => {
      // Clear tokens even if logout fails
      localStorage.removeItem('accessToken');
      Cookies.remove('refreshToken');
      // Remove auth/me cache khi logout
      queryClient.removeQueries({ queryKey: ['auth', 'me'] });
      queryClient.clear();
      toast.error('Phiên đăng nhập đã kết thúc.');
      navigate('/auth/login');
    },
  });
};

// Forgot Password Mutation
export const useForgotPassword = () => {
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (body: ForgotPasswordBody) => authApi.forgotPassword(body),
    onSuccess: () => {
      toast.success('Đặt lại mật khẩu thành công.');
      navigate('/auth/login?passwordReset=true');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể đặt lại mật khẩu.'));
    },
  });
};

// Change Password Mutation
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (body: ChangePasswordBody) => authApi.changePassword(body),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể đổi mật khẩu.'));
    },
  });
};

// Update Profile Mutation
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProfileBody) => authApi.updateProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success('Cập nhật hồ sơ thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật hồ sơ.'));
    },
  });
};

// List login devices/sessions
export const useMyDevices = () => {
  return useQuery({
    queryKey: ['auth', 'devices'],
    queryFn: () => authApi.getDevices(),
  });
};

// Revoke a login device/session
export const useRevokeDevice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authApi.revokeDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'devices'] });
      toast.success('Đã đăng xuất thiết bị.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể đăng xuất thiết bị này.'));
    },
  });
};

// Get Google Link Mutation
export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: () => authApi.getGoogleLink(),
    onSuccess: (data) => {
      if (data?.data?.link) {
        window.location.href = data.data.link;
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể khởi tạo đăng nhập Google.'));
    },
  });
};


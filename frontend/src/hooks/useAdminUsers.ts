import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUsersApi, type GetAdminUsersParams, type CreateUserBody, type UpdateUserBody, type UpdateUserStatusBody } from '../api/admin';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Get admin users
export const useAdminUsers = (params?: GetAdminUsersParams) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const response = await adminUsersApi.getUsers(params);
      return response;
    },
  });
};

// Get user by ID
export const useAdminUser = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => adminUsersApi.getUserById(id),
    enabled: !!id,
  });
};

// Create user mutation
export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (body: CreateUserBody) => adminUsersApi.createUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Đã tạo người dùng.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể tạo người dùng.'));
    },
  });
};

// Update user mutation
export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserBody }) => 
      adminUsersApi.updateUser(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.id] });
      toast.success('Đã cập nhật người dùng.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật người dùng.'));
    },
  });
};

// Delete user mutation
export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => adminUsersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Đã xóa người dùng.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể xóa người dùng.'));
    },
  });
};

// Update user status mutation
export const useUpdateAdminUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserStatusBody }) => 
      adminUsersApi.updateUserStatus(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.id] });
      toast.success('Đã cập nhật trạng thái người dùng.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật trạng thái người dùng.'));
    },
  });
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionsApi, type Permission, type CreatePermissionBody, type UpdatePermissionBody, type GetPermissionsParams } from '../api/permissions';
import { toast } from 'sonner';

// Get list permissions
export const usePermissions = (params?: GetPermissionsParams) => {
  return useQuery({
    queryKey: ['permissions', params],
    queryFn: () => permissionsApi.getPermissions(params),
  });
};

// Get permission by ID
export const usePermission = (id: string) => {
  return useQuery({
    queryKey: ['permissions', id],
    queryFn: () => permissionsApi.getPermissionById(id),
    enabled: !!id,
  });
};

// Create permission mutation
export const useCreatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePermissionBody) => permissionsApi.createPermission(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Đã tạo permission thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo permission');
    },
  });
};

// Update permission mutation
export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePermissionBody }) =>
      permissionsApi.updatePermission(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['permissions', variables.id] });
      toast.success('Đã cập nhật permission thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật permission');
    },
  });
};

// Delete permission mutation
export const useDeletePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permissionsApi.deletePermission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success('Đã xóa permission thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa permission');
    },
  });
};


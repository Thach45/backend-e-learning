import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, type Role, type CreateRoleBody, type UpdateRoleBody, type AssignPermissionsBody, type UnassignPermissionsBody } from '../api/roles';
import { toast } from 'sonner';

// Get list roles
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getRoles(),
  });
};

// Get role by ID (includes permissions)
export const useRole = (id: string) => {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => rolesApi.getRoleById(id),
    enabled: !!id,
  });
};

// Create role mutation
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateRoleBody) => rolesApi.createRole(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Đã tạo role thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo role');
    },
  });
};

// Update role mutation
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateRoleBody }) =>
      rolesApi.updateRole(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] });
      toast.success('Đã cập nhật role thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật role');
    },
  });
};

// Delete role mutation
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Đã xóa role thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa role');
    },
  });
};

// Assign permissions to role mutation
export const useAssignPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, body }: { roleId: string; body: AssignPermissionsBody }) =>
      rolesApi.assignPermissions(roleId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId] });
      toast.success('Đã gán permissions thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gán permissions');
    },
  });
};

// Unassign permissions from role mutation
export const useUnassignPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, body }: { roleId: string; body: UnassignPermissionsBody }) =>
      rolesApi.unassignPermissions(roleId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId] });
      toast.success('Đã gỡ permissions thành công!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi gỡ permissions');
    },
  });
};


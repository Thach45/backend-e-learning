import { apiClient } from './axios';

export type RoleName = 'ADMIN' | 'CLIENT' | 'INSTRUCTOR';

export type Role = {
  id: string;
  name: RoleName;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdById?: string | null;
  updatedById?: string | null;
  permissions?: Permission[]; // Direct permissions array
  rolePermissions?: Array<{ permission: Permission }>; // From include relation
};

export type Permission = {
  id: string;
  name: string;
  description: string;
  path: string;
  method: string;
};

export type CreateRoleBody = {
  name: RoleName;
  description?: string;
  isActive?: boolean;
};

export type UpdateRoleBody = {
  name?: RoleName;
  description?: string;
  isActive?: boolean;
};

export type AssignPermissionsBody = {
  permissionIds: string[];
};

export type UnassignPermissionsBody = AssignPermissionsBody;

export type AssignPermissionsResponse = {
  success: boolean;
};

export const rolesApi = {
  // Get list roles
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get('/roles');
    // Backend returns { data: Role[], total: number }
    return response.data?.data.data || response.data || [];
  },

  // Get role by ID (includes permissions)
  getRoleById: async (id: string): Promise<Role> => {
    const response = await apiClient.get(`/roles/${id}`);
    return response.data;
  },

  // Create role
  createRole: async (body: CreateRoleBody): Promise<Role> => {
    const response = await apiClient.post('/roles', body);
    return response.data;
  },

  // Update role
  updateRole: async (id: string, body: UpdateRoleBody): Promise<Role> => {
    const response = await apiClient.patch(`/roles/${id}`, body);
    return response.data;
  },

  // Delete role
  deleteRole: async (id: string): Promise<AssignPermissionsResponse> => {
    const response = await apiClient.delete(`/roles/${id}`);
    return response.data;
  },

  // Assign permissions to role
  assignPermissions: async (roleId: string, body: AssignPermissionsBody): Promise<AssignPermissionsResponse> => {
    const response = await apiClient.post(`/roles/${roleId}/permissions/assign`, body);
    return response.data;
  },

  // Unassign permissions from role
  unassignPermissions: async (roleId: string, body: UnassignPermissionsBody): Promise<AssignPermissionsResponse> => {
    const response = await apiClient.post(`/roles/${roleId}/permissions/unassign`, body);
    return response.data;
  },
};


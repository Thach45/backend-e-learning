import { apiClient } from './axios';

export type PermissionMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

export type Permission = {
  id: string;
  name: string;
  description: string;
  path: string;
  method: PermissionMethod;
  createdById?: string;
  updatedById?: string;
  createdAt: string;
  updatedAt: string;
};

export type GetPermissionsResponse = {
  data: Permission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreatePermissionBody = {
  name: string;
  description?: string;
  path: string;
  method: PermissionMethod;
};

export type UpdatePermissionBody = CreatePermissionBody;

export type GetPermissionsParams = {
  page?: number;
  limit?: number;
};

export const permissionsApi = {
  // Get list permissions
  getPermissions: async (params?: GetPermissionsParams): Promise<GetPermissionsResponse> => {
    const response = await apiClient.get('/permissions', { params });
    
    return response.data.data;
  },

  // Get permission by ID
  getPermissionById: async (id: string): Promise<Permission> => {
    const response = await apiClient.get(`/permissions/${id}`);
    return response.data;
  },

  // Create permission
  createPermission: async (body: CreatePermissionBody): Promise<Permission> => {
    const response = await apiClient.post('/permissions', body);
    return response.data;
  },

  // Update permission
  updatePermission: async (id: string, body: UpdatePermissionBody): Promise<Permission> => {
    const response = await apiClient.put(`/permissions/${id}`, body);
    return response.data;
  },

  // Delete permission
  deletePermission: async (id: string): Promise<void> => {
    await apiClient.delete(`/permissions/${id}`);
  },
};


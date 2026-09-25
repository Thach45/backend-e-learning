import { apiClient } from './axios';

export type AuditLogEntry = {
  id: string;
  actorId?: string | null;
  actor?: { id: string; name: string; email: string } | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: unknown;
  ipAddress?: string | null;
  createdAt: string;
};

export type GetAuditLogsResponse = {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetAuditLogsParams = {
  page?: number;
  limit?: number;
  action?: string;
  targetType?: string;
  actorId?: string;
};

export const auditLogsApi = {
  getLogs: async (params?: GetAuditLogsParams): Promise<GetAuditLogsResponse> => {
    const response = await apiClient.get('/admin/audit-logs', { params });
    return response.data.data;
  },
};

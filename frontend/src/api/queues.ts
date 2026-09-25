import apiClient from './axios';

export type JobState = 'waiting' | 'active' | 'delayed' | 'failed' | 'completed';
export type QueueOverview = { name: string; label: string; counts: Record<JobState, number> };
export type QueueJob = {
  id: string;
  name: string;
  attemptsMade: number;
  maxAttempts: number;
  failedReason: string | null;
  timestamp: number;
  delayUntil: number | null;
  info: { kind?: string; to?: string; subject?: string; campaignId?: string; orderId?: string };
};
export type SystemStatus = {
  database: { ok: boolean; ms: number | null };
  redis: boolean;
  mail: { sentToday: number; dailyCap: number; transactionalReserve: number; campaignBudgetLeft: number; resendConfigured: boolean; webhookConfigured: boolean };
  process: { uptimeSeconds: number; rssMb: number; heapUsedMb: number; node: string };
  activeUsers: number | null;
  serverTime: string;
};

export const queuesApi = {
  overview: async (): Promise<QueueOverview[]> => (await apiClient.get('/admin/queues')).data.data,
  jobs: async (name: string, state: JobState): Promise<QueueJob[]> => (await apiClient.get(`/admin/queues/${name}/jobs`, { params: { state, limit: 50 } })).data.data,
  retry: async (name: string, id: string) => (await apiClient.post(`/admin/queues/${name}/jobs/${encodeURIComponent(id)}/retry`)).data.data,
  remove: async (name: string, id: string) => (await apiClient.delete(`/admin/queues/${name}/jobs/${encodeURIComponent(id)}`)).data.data,
  retryAll: async (name: string): Promise<{ retried: number }> => (await apiClient.post(`/admin/queues/${name}/retry-failed`)).data.data,
  system: async (): Promise<SystemStatus> => (await apiClient.get('/admin/system/status')).data.data,
};

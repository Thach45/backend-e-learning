import apiClient from './axios';

export type CampaignStatus =
  | 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'CANCELLED';

export type Audience =
  | { type: 'ALL_USERS' }
  | { type: 'ROLE'; role: 'CLIENT' | 'INSTRUCTOR' }
  | { type: 'COURSE_ENROLLEES'; courseId: string }
  | { type: 'INSTRUCTOR_STUDENTS' }
  | { type: 'INTEREST_TAG'; tagId: string }
  | { type: 'SPECIFIC_USERS'; userIds: string[] };

export type Campaign = {
  id: string;
  senderId: string;
  sender: { id: string; name: string };
  subject: string;
  body: string;
  audience: Audience;
  status: CampaignStatus;
  isApproved: boolean;
  isServiceNotice: boolean;
  approvedById: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CampaignInput = { subject: string; body: string; audience: Audience; isServiceNotice?: boolean };

export const STATUS_LABELS: Record<CampaignStatus, { label: string; cls: string }> = {
  DRAFT: { label: 'Nháp', cls: 'bg-slate-100 text-slate-700' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', cls: 'bg-amber-100 text-amber-800' },
  APPROVED: { label: 'Đã duyệt', cls: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Bị từ chối', cls: 'bg-red-100 text-red-700' },
  SCHEDULED: { label: 'Đã lên lịch', cls: 'bg-blue-100 text-blue-800' },
  SENDING: { label: 'Đang gửi', cls: 'bg-indigo-100 text-indigo-800' },
  SENT: { label: 'Đã gửi', cls: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Đã huỷ', cls: 'bg-slate-200 text-slate-600' },
};

export const EDITABLE_STATUSES: CampaignStatus[] = ['DRAFT', 'REJECTED', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED'];

export type CampaignList = { data: Campaign[]; total: number; page: number; limit: number; totalPages: number };

export const emailCampaignsApi = {
  list: async (params?: { page?: number; limit?: number; status?: CampaignStatus; mine?: boolean }): Promise<CampaignList> =>
    (await apiClient.get('/email-campaigns', { params: { ...params, mine: params?.mine === undefined ? undefined : String(params.mine) } })).data.data,
  get: async (id: string): Promise<Campaign> => (await apiClient.get(`/email-campaigns/${id}`)).data.data,
  create: async (body: CampaignInput): Promise<Campaign> => (await apiClient.post('/email-campaigns', body)).data.data,
  update: async (id: string, body: Partial<CampaignInput>): Promise<Campaign> => (await apiClient.put(`/email-campaigns/${id}`, body)).data.data,
  remove: async (id: string) => { await apiClient.delete(`/email-campaigns/${id}`); },
  previewAudience: async (id: string): Promise<{ count: number; sample: string[] }> =>
    (await apiClient.post(`/email-campaigns/${id}/preview-audience`)).data.data,
  testSend: async (id: string): Promise<{ sentTo: string }> => (await apiClient.post(`/email-campaigns/${id}/test-send`)).data.data,
  submit: async (id: string): Promise<Campaign> => (await apiClient.post(`/email-campaigns/${id}/submit`)).data.data,
  approve: async (id: string): Promise<Campaign> => (await apiClient.post(`/admin/email-campaigns/${id}/approve`)).data.data,
  reject: async (id: string, reason: string): Promise<Campaign> => (await apiClient.post(`/admin/email-campaigns/${id}/reject`, { reason })).data.data,
  send: async (id: string, scheduledAt?: string): Promise<Campaign> => (await apiClient.post(`/email-campaigns/${id}/send`, scheduledAt ? { scheduledAt } : {})).data.data,
  cancel: async (id: string): Promise<Campaign> => (await apiClient.post(`/email-campaigns/${id}/cancel`)).data.data,

  // Từ chối nhận thư
  getPreferences: async (): Promise<{ campaignEmails: boolean }> => (await apiClient.get('/email/preferences')).data.data,
  setPreferences: async (campaignEmails: boolean): Promise<{ campaignEmails: boolean }> =>
    (await apiClient.put('/email/preferences', { campaignEmails })).data.data,
  unsubscribeInfo: async (token: string): Promise<{ email: string; optedOut: boolean }> =>
    (await apiClient.get('/email/unsubscribe', { params: { token } })).data.data,
  unsubscribe: async (token: string) => (await apiClient.post('/email/unsubscribe', null, { params: { token } })).data.data,
  resubscribe: async (token: string) => (await apiClient.post('/email/resubscribe', null, { params: { token } })).data.data,
};

import apiClient from './axios';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'ACCOUNT' | 'PAYMENT' | 'COURSE' | 'TECHNICAL' | 'OTHER';
export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH';

export const TICKET_STATUS: Record<TicketStatus, { label: string; cls: string }> = {
  OPEN: { label: 'Mới', cls: 'bg-blue-100 text-blue-800' },
  IN_PROGRESS: { label: 'Đang xử lý', cls: 'bg-amber-100 text-amber-800' },
  RESOLVED: { label: 'Đã giải quyết', cls: 'bg-emerald-100 text-emerald-800' },
  CLOSED: { label: 'Đã đóng', cls: 'bg-slate-200 text-slate-600' },
};
export const TICKET_CATEGORY: Record<TicketCategory, string> = {
  ACCOUNT: 'Tài khoản', PAYMENT: 'Thanh toán', COURSE: 'Khóa học', TECHNICAL: 'Lỗi kỹ thuật', OTHER: 'Khác',
};
export const TICKET_PRIORITY: Record<TicketPriority, string> = { LOW: 'Thấp', NORMAL: 'Bình thường', HIGH: 'Cao' };

export type TicketSummary = {
  id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  assignedToId: string | null;
  lastMessageAt: string;
  createdAt: string;
  closedAt: string | null;
  user: { id: string; name: string; email: string };
  _count: { messages: number };
};
export type TicketMessage = { id: string; body: string; isStaff: boolean; createdAt: string; author: { id: string; name: string; avatar: string | null } };
export type TicketDetail = TicketSummary & { messages: TicketMessage[] };
export type TicketList = { data: TicketSummary[]; total: number; page: number; limit: number; totalPages: number; counts?: Record<TicketStatus, number> };

export type Faq = { id: string; question: string; answer: string };
export type FaqCategoryPublic = { id: string; name: string; faqs: Faq[] };
export type FaqCategoryAdmin = { id: string; name: string; orderIndex: number; faqs: Array<Faq & { categoryId: string; orderIndex: number; isPublished: boolean }> };

export const supportApi = {
  create: async (body: { subject: string; category: TicketCategory; body: string }): Promise<TicketDetail> => (await apiClient.post('/support/tickets', body)).data.data,
  listMine: async (params?: { page?: number; status?: TicketStatus }): Promise<TicketList> => (await apiClient.get('/support/tickets', { params })).data.data,
  get: async (id: string): Promise<TicketDetail> => (await apiClient.get(`/support/tickets/${id}`)).data.data,
  post: async (id: string, body: string): Promise<TicketDetail> => (await apiClient.post(`/support/tickets/${id}/messages`, { body })).data.data,
  close: async (id: string): Promise<TicketDetail> => (await apiClient.post(`/support/tickets/${id}/close`)).data.data,

  listAdmin: async (params?: { page?: number; status?: TicketStatus; category?: TicketCategory; assigned?: string; search?: string }): Promise<TicketList> =>
    (await apiClient.get('/admin/support/tickets', { params })).data.data,
  reply: async (id: string, body: string): Promise<TicketDetail> => (await apiClient.post(`/admin/support/tickets/${id}/reply`, { body })).data.data,
  update: async (id: string, body: { status?: TicketStatus; priority?: TicketPriority; assignedToId?: string | null }): Promise<TicketDetail> =>
    (await apiClient.put(`/admin/support/tickets/${id}`, body)).data.data,

  faqs: async (q?: string): Promise<FaqCategoryPublic[]> => (await apiClient.get('/faqs', { params: { q: q || undefined } })).data.data,
  faqAdmin: async (): Promise<FaqCategoryAdmin[]> => (await apiClient.get('/admin/faq')).data.data,
  createCategory: async (body: { name: string; orderIndex?: number }) => (await apiClient.post('/admin/faq/categories', body)).data.data,
  updateCategory: async (id: string, body: { name?: string; orderIndex?: number }) => (await apiClient.put(`/admin/faq/categories/${id}`, body)).data.data,
  deleteCategory: async (id: string) => { await apiClient.delete(`/admin/faq/categories/${id}`); },
  createItem: async (body: { categoryId: string; question: string; answer: string; isPublished?: boolean; orderIndex?: number }) => (await apiClient.post('/admin/faq/items', body)).data.data,
  updateItem: async (id: string, body: Partial<{ categoryId: string; question: string; answer: string; isPublished: boolean; orderIndex: number }>) => (await apiClient.put(`/admin/faq/items/${id}`, body)).data.data,
  deleteItem: async (id: string) => { await apiClient.delete(`/admin/faq/items/${id}`); },
};

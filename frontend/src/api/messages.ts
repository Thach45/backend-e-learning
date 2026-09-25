import apiClient from './axios';

export type Person = { id: string; name: string; avatar: string | null };
export type ConversationRow = { id: string; other: Person; lastMessage: { preview: string; mine: boolean; createdAt: string } | null; unread: number; blocked: boolean; blockedByMe: boolean; lastMessageAt: string };
export type ChatMessage = { id: string; senderId: string; body: string; createdAt: string; readAt: string | null; mine: boolean };

export const messagesApi = {
  list: async (): Promise<ConversationRow[]> => (await apiClient.get('/conversations')).data.data,
  unread: async (): Promise<number> => (await apiClient.get('/conversations/unread-count')).data.data.count,
  contacts: async (search?: string): Promise<{ instructors: Person[]; students: Person[] }> => (await apiClient.get('/conversations/contacts', { params: { search } })).data.data,
  start: async (toUserId: string, body: string): Promise<{ conversationId: string }> => (await apiClient.post('/conversations', { toUserId, body })).data.data,
  messages: async (id: string, before?: string): Promise<{ messages: ChatMessage[]; hasMore: boolean }> => (await apiClient.get(`/conversations/${id}/messages`, { params: { before, limit: 30 } })).data.data,
  send: async (id: string, body: string) => (await apiClient.post(`/conversations/${id}/messages`, { body })).data.data,
  markRead: async (id: string) => (await apiClient.put(`/conversations/${id}/read`)).data.data,
  block: async (id: string, blocked: boolean) => (await apiClient.put(`/conversations/${id}/block`, { blocked })).data.data,
};

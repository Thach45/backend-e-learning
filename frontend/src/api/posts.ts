import apiClient from './axios';

export type PostKind = 'BLOG' | 'PAGE';
export type PostStatus = 'DRAFT' | 'PUBLISHED';
export type PostCard = { id: string; kind: PostKind; slug: string; title: string; excerpt: string | null; coverUrl: string | null; publishedAt: string | null; views: number; authorName: string };
export type PostFull = PostCard & { body: string; updatedAt: string };
export type AdminPostRow = PostCard & { status: PostStatus; showInFooter: boolean; updatedAt: string };
export type AdminPost = { id: string; kind: PostKind; slug: string; title: string; excerpt: string | null; coverUrl: string | null; body: string; status: PostStatus; showInFooter: boolean; publishedAt: string | null };
export type Paged<T> = { items: T[]; total: number; page: number; limit: number };
export type PostForm = { kind: PostKind; title: string; slug?: string; excerpt?: string | null; coverUrl?: string | null; body: string; status: PostStatus; showInFooter: boolean };

export const postsApi = {
  blog: async (params: { search?: string; page?: number; limit?: number }): Promise<Paged<PostCard>> => (await apiClient.get('/blog', { params })).data.data,
  blogPost: async (slug: string): Promise<PostFull> => (await apiClient.get(`/blog/${slug}`)).data.data,
  page: async (slug: string): Promise<PostFull> => (await apiClient.get(`/pages/${slug}`)).data.data,
  footerPages: async (): Promise<{ slug: string; title: string }[]> => (await apiClient.get('/pages/footer')).data.data,
  adminList: async (params: { kind?: PostKind; status?: PostStatus; search?: string; page?: number }): Promise<Paged<AdminPostRow>> => (await apiClient.get('/admin/posts', { params: { ...params, limit: 20 } })).data.data,
  adminGet: async (id: string): Promise<AdminPost> => (await apiClient.get(`/admin/posts/${id}`)).data.data,
  create: async (body: PostForm): Promise<AdminPost> => (await apiClient.post('/admin/posts', body)).data.data,
  update: async (id: string, body: Partial<Omit<PostForm, 'kind'>>): Promise<AdminPost> => (await apiClient.put(`/admin/posts/${id}`, body)).data.data,
  remove: async (id: string) => (await apiClient.delete(`/admin/posts/${id}`)).data.data,
};

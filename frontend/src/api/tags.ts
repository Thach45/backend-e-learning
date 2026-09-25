import apiClient from './axios';

export type TagType = 'SKILL' | 'TOPIC' | 'TOOL';

export type Tag = {
  id: string;
  name: string;
  slug: string;
  type: TagType;
  categoryId: string | null;
};

export type AdminTag = Tag & { isActive: boolean; coursesCount: number; usersCount: number };

export const TAG_TYPE_LABELS: Record<TagType, string> = {
  SKILL: 'Kỹ năng',
  TOPIC: 'Chủ đề',
  TOOL: 'Công cụ',
};

export const tagsApi = {
  list: async (params?: { q?: string; type?: TagType; categoryId?: string; limit?: number }): Promise<Tag[]> => {
    const res = await apiClient.get('/tags', { params });
    return res.data.data;
  },
  listAdmin: async (): Promise<AdminTag[]> => {
    const res = await apiClient.get('/admin/tags');
    return res.data.data;
  },
  create: async (body: { name: string; type: TagType; categoryId?: string | null }) => {
    const res = await apiClient.post('/admin/tags', body);
    return res.data.data as Tag & { isActive: boolean };
  },
  update: async (id: string, body: { name?: string; type?: TagType; categoryId?: string | null; isActive?: boolean }) => {
    const res = await apiClient.put(`/admin/tags/${id}`, body);
    return res.data.data as Tag & { isActive: boolean };
  },
  remove: async (id: string) => {
    await apiClient.delete(`/admin/tags/${id}`);
  },
  setCourseTags: async (courseId: string, tagIds: string[]): Promise<Tag[]> => {
    const res = await apiClient.put(`/instructor/courses/${courseId}/tags`, { tagIds });
    return res.data.data;
  },
};

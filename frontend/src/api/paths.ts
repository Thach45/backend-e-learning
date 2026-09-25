import apiClient from './axios';
import type { CourseCard } from './collections';

export type PathRow = { id: string; slug: string; title: string; description: string | null; coverUrl: string | null; courseCount: number };
export type PathDetail = { id: string; slug: string; title: string; description: string | null; coverUrl: string | null; courses: (CourseCard & { note: string | null })[] };
export type PathProgress = { steps: { courseId: string; enrolled: boolean; completed: boolean }[]; completed: number; total: number; percent: number; currentCourseId: string | null };
export type AdminPathRow = { id: string; slug: string; title: string; isPublished: boolean; updatedAt: string; courseCount: number };
export type AdminPath = { id: string; slug: string; title: string; description: string | null; coverUrl: string | null; isPublished: boolean; courses: { courseId: string; note: string | null; course: { title: string; status: string } }[] };
export type PathForm = { title: string; slug?: string; description?: string | null; coverUrl?: string | null; isPublished: boolean; courses: { courseId: string; note?: string | null }[] };

export const pathsApi = {
  list: async (): Promise<PathRow[]> => (await apiClient.get('/paths')).data.data,
  detail: async (slug: string): Promise<PathDetail> => (await apiClient.get(`/paths/${slug}`)).data.data,
  progress: async (slug: string): Promise<PathProgress> => (await apiClient.get(`/paths/${slug}/progress`)).data.data,
  adminList: async (): Promise<AdminPathRow[]> => (await apiClient.get('/admin/paths')).data.data,
  adminGet: async (id: string): Promise<AdminPath> => (await apiClient.get(`/admin/paths/${id}`)).data.data,
  create: async (b: PathForm) => (await apiClient.post('/admin/paths', b)).data.data,
  update: async (id: string, b: Partial<PathForm>) => (await apiClient.put(`/admin/paths/${id}`, b)).data.data,
  remove: async (id: string) => (await apiClient.delete(`/admin/paths/${id}`)).data.data,
};

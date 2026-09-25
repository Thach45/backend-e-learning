import apiClient from './axios';

export type CollectionRow = { id: string; title: string; description: string | null; isPublic: boolean; updatedAt: string; courseCount: number; contains?: boolean };
export type CourseCard = { id: string; title: string; thumbnail: string | null; price: number; salePrice: number | null; level: string; instructor: { id: string; name: string } };
export type CollectionDetail = { id: string; title: string; description: string | null; isPublic: boolean; updatedAt: string; ownerName: string; isOwner: boolean; courses: CourseCard[] };
export type CollectionForm = { title: string; description?: string | null; isPublic?: boolean };

export const collectionsApi = {
  mine: async (courseId?: string): Promise<CollectionRow[]> => (await apiClient.get('/collections/mine', { params: { courseId } })).data.data,
  create: async (b: CollectionForm) => (await apiClient.post('/collections', b)).data.data,
  update: async (id: string, b: Partial<CollectionForm>) => (await apiClient.put(`/collections/${id}`, b)).data.data,
  remove: async (id: string) => (await apiClient.delete(`/collections/${id}`)).data.data,
  addCourse: async (id: string, courseId: string) => (await apiClient.post(`/collections/${id}/courses`, { courseId })).data.data,
  removeCourse: async (id: string, courseId: string) => (await apiClient.delete(`/collections/${id}/courses/${courseId}`)).data.data,
  detail: async (id: string): Promise<CollectionDetail> => (await apiClient.get(`/collections/${id}`)).data.data,
};

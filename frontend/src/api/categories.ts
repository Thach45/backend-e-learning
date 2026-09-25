import apiClient from './axios';

export type Category = {
  id: string;
  name: string;
  imageUrl?: string | null;
  parentId?: string | null;
  countCourses: number;
  children: Category[];
};

const normalizeCategoryList = (payload: unknown): Category[] => {
  if (Array.isArray(payload)) {
    return payload as Category[];
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: Category[] }).data;
  }

  return [];
};

export const categoriesApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return normalizeCategoryList(response.data.data);
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data.data;
  },
};


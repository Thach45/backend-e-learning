import apiClient from './axios';

// Types
export type DocumentCategory = {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  icon?: string;
  isActive: boolean;
  documentCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type GetDocumentCategoriesParams = {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
};

export type GetDocumentCategoriesResponse = {
  data: DocumentCategory[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateDocumentCategoryBody = {
  name: string;
  description?: string;
  slug?: string;
  icon?: string;
  isActive?: boolean;
};

export type UpdateDocumentCategoryBody = Partial<CreateDocumentCategoryBody>;

// API functions
export const documentCategoriesApi = {
  // Public
  getCategories: async (params?: GetDocumentCategoriesParams): Promise<GetDocumentCategoriesResponse> => {
    const response = await apiClient.get('/document-categories', { params });
    return response.data.data || response.data;
  },

  getCategoryById: async (id: string): Promise<DocumentCategory> => {
    const response = await apiClient.get(`/document-categories/${id}`);
    return response.data.data || response.data;
  },

  // Admin
  createCategory: async (body: CreateDocumentCategoryBody): Promise<DocumentCategory> => {
    const response = await apiClient.post('/admin/document-categories', body);
    return response.data.data || response.data;
  },

  updateCategory: async (id: string, body: UpdateDocumentCategoryBody): Promise<DocumentCategory> => {
    const response = await apiClient.put(`/admin/document-categories/${id}`, body);
    return response.data.data || response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/document-categories/${id}`);
  },
};


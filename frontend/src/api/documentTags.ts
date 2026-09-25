import apiClient from './axios';

// Types
export type DocumentTag = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
  documentCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type GetDocumentTagsParams = {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
};

export type GetDocumentTagsResponse = {
  data: DocumentTag[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateDocumentTagBody = {
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type UpdateDocumentTagBody = Partial<CreateDocumentTagBody>;

// API functions
export const documentTagsApi = {
  // Public
  getTags: async (params?: GetDocumentTagsParams): Promise<GetDocumentTagsResponse> => {
    const response = await apiClient.get('/document-tags', { params });
    return response.data.data || response.data;
  },

  getTagById: async (id: string): Promise<DocumentTag> => {
    const response = await apiClient.get(`/document-tags/${id}`);
    return response.data.data || response.data;
  },

  // Admin
  createTag: async (body: CreateDocumentTagBody): Promise<DocumentTag> => {
    const response = await apiClient.post('/document-tags', body);
    return response.data.data || response.data;
  },

  updateTag: async (id: string, body: UpdateDocumentTagBody): Promise<DocumentTag> => {
    const response = await apiClient.put(`/document-tags/${id}`, body);
    return response.data.data || response.data;
  },

  deleteTag: async (id: string): Promise<void> => {
    await apiClient.delete(`/document-tags/${id}`);
  },
};


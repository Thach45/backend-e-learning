import apiClient from './axios';

// Types
export type MaterialType = 'PDF' | 'DOC' | 'PPT' | 'ZIP' | 'LINK' | 'OTHER';
export type DocumentSort = 'newest' | 'trending' | 'most_viewed' | 'most_downloaded' | 'most_liked';

export type Document = {
  id: string;
  title: string;
  type: MaterialType;
  url: string;
  uploadedAt: string;
  uploader?: {
    id: string;
    name: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
  };
  university?: string;
  subject?: string;
  pages?: number;
  thumbnail?: string;
  isVerified: boolean;
  views: number;
  downloads: number;
  likes: number;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    color?: string;
  }>;
  isLiked?: boolean;
};

export type TopContributor = {
  id: string;
  name: string;
  avatar?: string;
  uploads: number;
  university?: string;
};

export type GetDocumentsParams = {
  page?: number;
  limit?: number;
  categoryId?: string;
  university?: string;
  subject?: string;
  type?: MaterialType;
  sort?: DocumentSort;
  search?: string;
  uploaderId?: string;
};

export type GetDocumentsResponse = {
  data: Document[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetTopContributorsResponse = {
  data: TopContributor[];
};

export type CreateDocumentBody = {
  title: string;
  type: MaterialType;
  url: string;
  categoryId?: string;
  university?: string;
  subject?: string;
  pages?: number;
  thumbnail?: string;
  tagIds?: string[];
};

export type UpdateDocumentBody = Partial<Omit<CreateDocumentBody, 'type' | 'url'>>;

export type LikeResponse = {
  liked: boolean;
  totalLikes: number;
};

export type DownloadResponse = {
  url: string;
  totalDownloads: number;
};

// API functions
export const documentsApi = {
  // Public
  getDocuments: async (params?: GetDocumentsParams): Promise<GetDocumentsResponse> => {
    const response = await apiClient.get('/documents', { params });
    return response.data.data || response.data;
  },

  getDocumentById: async (id: string): Promise<Document> => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data.data || response.data;
  },

  getTrendingDocuments: async (limit = 10): Promise<GetDocumentsResponse> => {
    const response = await apiClient.get('/documents/trending', { params: { limit } });
    return response.data.data || response.data;
  },

  getTopContributors: async (limit = 10): Promise<GetTopContributorsResponse> => {
    const response = await apiClient.get('/documents/top-contributors', { params: { limit } });
    return response.data.data || response.data;
  },

  // Authenticated
  createDocument: async (body: CreateDocumentBody): Promise<Document> => {
    const response = await apiClient.post('/documents', body);
    return response.data.data || response.data;
  },

  updateDocument: async (id: string, body: UpdateDocumentBody): Promise<Document> => {
    const response = await apiClient.put(`/documents/${id}`, body);
    return response.data.data || response.data;
  },

  deleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },

  toggleLike: async (id: string): Promise<LikeResponse> => {
    const response = await apiClient.post(`/documents/${id}/like`);
    return response.data.data || response.data;
  },

  trackDownload: async (id: string): Promise<DownloadResponse> => {
    const response = await apiClient.post(`/documents/${id}/download`);
    return response.data.data || response.data;
  },

  getMyDocuments: async (params?: GetDocumentsParams): Promise<GetDocumentsResponse> => {
    const response = await apiClient.get('/my-documents', { params });
    return response.data.data || response.data;
  },

  getMyLikedDocuments: async (page = 1, limit = 20): Promise<GetDocumentsResponse> => {
    const response = await apiClient.get('/my-liked-documents', { params: { page, limit } });
    return response.data.data || response.data;
  },

  // Admin
  getAdminDocuments: async (params?: GetDocumentsParams): Promise<GetDocumentsResponse> => {
    const response = await apiClient.get('/admin/documents', { params });
    return response.data.data || response.data;
  },

  toggleVerified: async (id: string, isVerified: boolean): Promise<Document> => {
    const response = await apiClient.put(`/admin/documents/${id}/verify`, { isVerified });
    return response.data.data || response.data;
  },

  adminDeleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/documents/${id}`);
  },
};


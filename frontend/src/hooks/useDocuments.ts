import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { documentsApi } from '../api/documents';
import type { GetDocumentsParams, CreateDocumentBody, UpdateDocumentBody } from '../api/documents';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Query keys
const DOCUMENTS_KEY = 'documents';
const DOCUMENT_KEY = 'document';
const TRENDING_KEY = 'trending-documents';
const TOP_CONTRIBUTORS_KEY = 'top-contributors';
const MY_DOCUMENTS_KEY = 'my-documents';
const MY_LIKED_DOCUMENTS_KEY = 'my-liked-documents';

// Queries
export const useDocuments = (params?: GetDocumentsParams) => {
  return useQuery({
    queryKey: [DOCUMENTS_KEY, params],
    queryFn: () => documentsApi.getDocuments(params),
  });
};

export const useDocument = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [DOCUMENT_KEY, id],
    queryFn: () => documentsApi.getDocumentById(id),
    enabled: enabled && !!id,
  });
};

export const useTrendingDocuments = (limit = 10) => {
  return useQuery({
    queryKey: [TRENDING_KEY, limit],
    queryFn: () => documentsApi.getTrendingDocuments(limit),
  });
};

export const useTopContributors = (limit = 10) => {
  return useQuery({
    queryKey: [TOP_CONTRIBUTORS_KEY, limit],
    queryFn: () => documentsApi.getTopContributors(limit),
  });
};

export const useMyDocuments = (params?: GetDocumentsParams) => {
  return useQuery({
    queryKey: [MY_DOCUMENTS_KEY, params],
    queryFn: () => documentsApi.getMyDocuments(params),
  });
};

export const useMyLikedDocuments = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: [MY_LIKED_DOCUMENTS_KEY, page, limit],
    queryFn: () => documentsApi.getMyLikedDocuments(page, limit),
  });
};

// Mutations
export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDocumentBody) => documentsApi.createDocument(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_DOCUMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TOP_CONTRIBUTORS_KEY] });
      toast.success('Đã đăng tài liệu thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Đăng tài liệu thất bại.'));
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateDocumentBody }) =>
      documentsApi.updateDocument(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [MY_DOCUMENTS_KEY] });
      toast.success('Đã cập nhật tài liệu.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Cập nhật tài liệu thất bại.'));
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_DOCUMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TOP_CONTRIBUTORS_KEY] });
      toast.success('Đã xóa tài liệu.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Xóa tài liệu thất bại.'));
    },
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.toggleLike(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [TRENDING_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_LIKED_DOCUMENTS_KEY] });
      toast.success('Đã cập nhật trạng thái yêu thích.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật yêu thích.'));
    },
  });
};

export const useTrackDownload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.trackDownload(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_KEY, id] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể ghi nhận lượt tải.'));
    },
  });
};

// Admin mutations
export const useToggleVerified = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) =>
      documentsApi.toggleVerified(id, isVerified),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_KEY, variables.id] });
      toast.success('Đã cập nhật trạng thái xác minh tài liệu.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Cập nhật xác minh thất bại.'));
    },
  });
};

export const useAdminDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentsApi.adminDeleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [TOP_CONTRIBUTORS_KEY] });
      toast.success('Đã xóa tài liệu khỏi hệ thống.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Xóa tài liệu thất bại.'));
    },
  });
};


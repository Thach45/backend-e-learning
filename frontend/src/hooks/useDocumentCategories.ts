import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  documentCategoriesApi,
  type GetDocumentCategoriesParams,
  type CreateDocumentCategoryBody,
  type UpdateDocumentCategoryBody,
} from '../api/documentCategories';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Query keys
const DOCUMENT_CATEGORIES_KEY = 'document-categories';
const DOCUMENT_CATEGORY_KEY = 'document-category';

// Queries
export const useDocumentCategories = (params?: GetDocumentCategoriesParams) => {
  return useQuery({
    queryKey: [DOCUMENT_CATEGORIES_KEY, params],
    queryFn: () => documentCategoriesApi.getCategories(params),
  });
};

export const useDocumentCategory = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [DOCUMENT_CATEGORY_KEY, id],
    queryFn: () => documentCategoriesApi.getCategoryById(id),
    enabled: enabled && !!id,
  });
};

// Mutations
export const useCreateDocumentCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDocumentCategoryBody) => documentCategoriesApi.createCategory(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_CATEGORIES_KEY] });
      toast.success('Đã tạo lĩnh vực tài liệu.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Tạo lĩnh vực thất bại.'));
    },
  });
};

export const useUpdateDocumentCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateDocumentCategoryBody }) =>
      documentCategoriesApi.updateCategory(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_CATEGORIES_KEY] });
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_CATEGORY_KEY, variables.id] });
      toast.success('Đã cập nhật lĩnh vực tài liệu.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Cập nhật lĩnh vực thất bại.'));
    },
  });
};

export const useDeleteDocumentCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentCategoriesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_CATEGORIES_KEY] });
      toast.success('Đã xóa lĩnh vực tài liệu.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Xóa lĩnh vực thất bại.'));
    },
  });
};


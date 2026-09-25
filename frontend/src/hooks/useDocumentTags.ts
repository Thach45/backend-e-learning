import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  documentTagsApi, 
  type GetDocumentTagsParams, 
  type CreateDocumentTagBody, 
  type UpdateDocumentTagBody 
} from '../api/documentTags';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Query keys
const DOCUMENT_TAGS_KEY = 'documentTags';

// Hook to get document tags
export const useDocumentTags = (params?: GetDocumentTagsParams) => {
  return useQuery({
    queryKey: [DOCUMENT_TAGS_KEY, params],
    queryFn: () => documentTagsApi.getTags(params),
  });
};

// Hook to get a single document tag
export const useDocumentTag = (id: string) => {
  return useQuery({
    queryKey: [DOCUMENT_TAGS_KEY, id],
    queryFn: () => documentTagsApi.getTagById(id),
    enabled: !!id,
  });
};

// Hook to create a document tag
export const useCreateDocumentTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (body: CreateDocumentTagBody) => documentTagsApi.createTag(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_TAGS_KEY] });
      toast.success('Đã tạo từ khóa tài liệu.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Tạo từ khóa thất bại.'));
    },
  });
};

// Hook to update a document tag
export const useUpdateDocumentTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateDocumentTagBody }) => 
      documentTagsApi.updateTag(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_TAGS_KEY] });
      toast.success('Đã cập nhật từ khóa tài liệu.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Cập nhật từ khóa thất bại.'));
    },
  });
};

// Hook to delete a document tag
export const useDeleteDocumentTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => documentTagsApi.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENT_TAGS_KEY] });
      toast.success('Đã xóa từ khóa tài liệu.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Xóa từ khóa thất bại.'));
    },
  });
};


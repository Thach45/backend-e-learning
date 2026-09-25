import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCategoriesApi, type CreateCategoryBody, type UpdateCategoryBody } from '../api/admin';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Get admin categories
export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminCategoriesApi.getCategories(),
  });
};

// Get category by ID
export const useAdminCategory = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'category', id],
    queryFn: () => adminCategoriesApi.getCategoryById(id),
    enabled: !!id,
  });
};

// Create category mutation
export const useCreateAdminCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (body: CreateCategoryBody) => adminCategoriesApi.createCategory(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      toast.success('Đã tạo danh mục.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể tạo danh mục.'));
    },
  });
};

// Update category mutation
export const useUpdateAdminCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCategoryBody }) => 
      adminCategoriesApi.updateCategory(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'category', variables.id] });
      toast.success('Đã cập nhật danh mục.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật danh mục.'));
    },
  });
};


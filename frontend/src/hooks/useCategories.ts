import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories';

// Get all categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get category by ID
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoriesApi.getCategoryById(id),
    enabled: !!id,
  });
};


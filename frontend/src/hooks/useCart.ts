import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart";
import { toast } from "sonner";

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

export const useGetCart = () => {
    return useQuery({
      queryKey: ['cart'],
      queryFn: () => cartApi.getCart(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

export const useAddToCart = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: (courseId: string) => cartApi.addToCart(courseId),
      onSuccess: () => {
       
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        toast.success('Đã thêm khóa học vào giỏ hàng.');
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, 'Không thể thêm vào giỏ hàng.'));
      },
    });
  };

export const useRemoveFromCart = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: (courseId: string) => cartApi.removeFromCart(courseId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        toast.success('Đã xóa khóa học khỏi giỏ hàng.');
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, 'Không thể xóa khỏi giỏ hàng.'));
      },
    });
  };

export const useClearCart = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: () => cartApi.clearCart(),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        toast.success('Đã xóa toàn bộ giỏ hàng.');
      },
      onError: (error) => {
        toast.error(getErrorMessage(error, 'Không thể xóa giỏ hàng.'));
      },
    });
  };
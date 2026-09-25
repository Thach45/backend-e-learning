import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, type GetOrdersParams, type CreateOrderBody, type UpdateOrderStatusBody } from '../api/orders';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Get my orders
export const useMyOrders = (params?: GetOrdersParams) => {
  return useQuery({
    queryKey: ['my-orders', params],
    queryFn: () => ordersApi.getMyOrders(params),
  });
};

// Get my order by ID
export const useMyOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['my-order', orderId],
    queryFn: () => ordersApi.getMyOrderById(orderId),
    enabled: !!orderId,
  });
};

// Create order mutation
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (body: CreateOrderBody) => ordersApi.createOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Tạo đơn hàng thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể tạo đơn hàng.'));
    },
  });
};

// Pay order mutation
export const usePayOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.payOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-courses'] });
      toast.success('Thanh toán đơn hàng thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Thanh toán thất bại.'));
    },
  });
};

// Admin: Get all orders
export const useAdminOrders = (params?: GetOrdersParams) => {
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => ordersApi.getOrders(params),
  });
};

// Admin: Get order by ID
export const useAdminOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: !!orderId,
  });
};

// Admin: Update order status mutation
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, body }: { orderId: string; body: UpdateOrderStatusBody }) => 
      ordersApi.updateOrderStatus(orderId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', variables.orderId] });
      toast.success('Cập nhật trạng thái đơn hàng thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật trạng thái đơn hàng.'));
    },
  });
};

// Get QR code
export const useQrCode = (orderId: string) => {
  return useQuery({
    queryKey: ['qr-code', orderId],
    queryFn: () => ordersApi.getQrCode(orderId),
    enabled: !!orderId,
  });
};

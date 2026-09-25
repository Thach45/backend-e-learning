import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { couponsApi, type CouponFormBody, type GetCouponsParams } from '../api/coupons';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string | string[] } } };
  const message = maybeAxiosError?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

export const useValidateCoupon = () =>
  useMutation({ mutationFn: (code: string) => couponsApi.validate(code) });

export const useAdminCoupons = (params?: GetCouponsParams) =>
  useQuery({ queryKey: ['admin-coupons', params], queryFn: () => couponsApi.getCoupons(params) });

export const useSaveCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: string; body: CouponFormBody }) => {
      if (id) {
        // Mã không được đổi sau khi tạo nên không gửi lên khi cập nhật
        const rest: Partial<CouponFormBody> = { ...body };
        delete rest.code;
        return couponsApi.updateCoupon(id, rest as Omit<CouponFormBody, 'code'>);
      }
      return couponsApi.createCoupon(body);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success(vars.id ? 'Đã cập nhật mã giảm giá.' : 'Đã tạo mã giảm giá.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Không thể lưu mã giảm giá.')),
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponsApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Đã xóa mã giảm giá.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Không thể xóa mã giảm giá.')),
  });
};

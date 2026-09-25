import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { siteSettingsApi, type UpdateSiteSettingsBody } from '../api/siteSettings';

/** Cấu hình công khai (link mạng xã hội, trạng thái bảo trì). Làm mới mỗi 60 giây để bảo trì có hiệu lực nhanh. */
export const usePublicSiteSettings = () =>
  useQuery({
    queryKey: ['site-settings', 'public'],
    queryFn: siteSettingsApi.getPublic,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

export const useAdminSiteSettings = () =>
  useQuery({ queryKey: ['site-settings', 'admin'], queryFn: siteSettingsApi.getAdmin });

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSiteSettingsBody) => siteSettingsApi.update(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Đã lưu cài đặt.');
    },
    onError: (error) => {
      const e = error as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Không thể lưu cài đặt. Kiểm tra lại các đường dẫn (phải bắt đầu bằng https://).');
    },
  });
};

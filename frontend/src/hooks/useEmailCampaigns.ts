import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { emailCampaignsApi, type CampaignInput, type CampaignStatus } from '../api/emailCampaigns';

const errMsg = (e: unknown, fallback: string) => {
  const m = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(m) ? m.join(', ') : m) || fallback;
};

export const useCampaigns = (params?: { page?: number; limit?: number; status?: CampaignStatus; mine?: boolean }) =>
  useQuery({ queryKey: ['email-campaigns', params], queryFn: () => emailCampaignsApi.list(params), refetchInterval: 15_000 });

export const useCampaign = (id: string | undefined) =>
  useQuery({
    queryKey: ['email-campaign', id],
    queryFn: () => emailCampaignsApi.get(id as string),
    enabled: !!id,
    // Đang gửi thì tự làm mới để thấy tiến độ
    refetchInterval: (q) => (['SENDING', 'SCHEDULED'].includes(q.state.data?.status ?? '') ? 3000 : false),
  });

/** Mọi thao tác trên chiến dịch: làm mới danh sách và chi tiết, báo lỗi rõ ràng theo thông điệp của server. */
const useCampaignMutation = <TArg, TRes>(fn: (arg: TArg) => Promise<TRes>, ok?: string, fail = 'Thao tác thất bại.') => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['email-campaigns'] });
      qc.invalidateQueries({ queryKey: ['email-campaign'] });
      if (ok) toast.success(ok);
    },
    onError: (e) => toast.error(errMsg(e, fail)),
  });
};

export const useCreateCampaign = () => useCampaignMutation((b: CampaignInput) => emailCampaignsApi.create(b), 'Đã lưu bản nháp.', 'Không thể lưu.');
export const useUpdateCampaign = () =>
  useCampaignMutation(({ id, body }: { id: string; body: Partial<CampaignInput> }) => emailCampaignsApi.update(id, body), 'Đã lưu. Nếu trước đó đã được duyệt, cần gửi duyệt lại.', 'Không thể lưu.');
export const useDeleteCampaign = () => useCampaignMutation((id: string) => emailCampaignsApi.remove(id), 'Đã xoá.', 'Không thể xoá.');
export const useSubmitCampaign = () => useCampaignMutation((id: string) => emailCampaignsApi.submit(id), 'Đã nộp.', 'Không thể nộp.');
export const useApproveCampaign = () => useCampaignMutation((id: string) => emailCampaignsApi.approve(id), 'Đã duyệt.', 'Không thể duyệt.');
export const useRejectCampaign = () =>
  useCampaignMutation(({ id, reason }: { id: string; reason: string }) => emailCampaignsApi.reject(id, reason), 'Đã từ chối.', 'Không thể từ chối.');
export const useSendCampaign = () =>
  useCampaignMutation(({ id, scheduledAt }: { id: string; scheduledAt?: string }) => emailCampaignsApi.send(id, scheduledAt), 'Đã đưa vào hàng đợi gửi.', 'Không thể gửi.');
export const useCancelCampaign = () => useCampaignMutation((id: string) => emailCampaignsApi.cancel(id), 'Đã huỷ chiến dịch.', 'Không thể huỷ.');
export const useTestSendCampaign = () =>
  useMutation({
    mutationFn: (id: string) => emailCampaignsApi.testSend(id),
    onSuccess: (r) => toast.success(`Đã gửi thử tới ${r.sentTo}.`),
    onError: (e) => toast.error(errMsg(e, 'Không thể gửi thử.')),
  });
export const usePreviewAudience = () =>
  useMutation({ mutationFn: (id: string) => emailCampaignsApi.previewAudience(id), onError: (e) => toast.error(errMsg(e, 'Không thể đếm người nhận.')) });

export const useEmailPreferences = (enabled = true) =>
  useQuery({ queryKey: ['email-preferences'], queryFn: emailCampaignsApi.getPreferences, enabled });
export const useSetEmailPreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: boolean) => emailCampaignsApi.setPreferences(v),
    onSuccess: (r) => {
      qc.setQueryData(['email-preferences'], r);
      toast.success(r.campaignEmails ? 'Bạn sẽ nhận thư thông báo.' : 'Đã ngừng nhận thư thông báo.');
    },
    onError: (e) => toast.error(errMsg(e, 'Không thể lưu lựa chọn.')),
  });
};

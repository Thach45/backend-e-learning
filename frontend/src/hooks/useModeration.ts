import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  moderationApi,
  type GetReportsParams,
  type ModerationListParams,
  type ReportReason,
  type ReportTargetType,
} from '../api/moderation';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string | string[] } } };
  const message = maybeAxiosError?.response?.data?.message;
  return (Array.isArray(message) ? message[0] : message) || fallback;
};

// Client: gửi báo cáo vi phạm
export const useCreateReport = () =>
  useMutation({
    mutationFn: (body: { targetType: ReportTargetType; targetId: string; reason: ReportReason; details?: string }) =>
      moderationApi.createReport(body),
    onSuccess: () => toast.success('Đã gửi báo cáo. Cảm ơn bạn đã giúp giữ cộng đồng lành mạnh.'),
    onError: (error) => toast.error(getErrorMessage(error, 'Không thể gửi báo cáo.')),
  });

export const usePendingReportCount = (enabled = true) =>
  useQuery({
    queryKey: ['admin-reports-pending'],
    queryFn: () => moderationApi.getPendingCount(),
    enabled,
    refetchInterval: 60_000,
  });

export const useAdminReports = (params?: GetReportsParams) =>
  useQuery({ queryKey: ['admin-reports', params], queryFn: () => moderationApi.getReports(params) });

export const useResolveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: 'REMOVE_CONTENT' | 'DISMISS'; note?: string }) =>
      moderationApi.resolveReport(id, { action, note }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports-pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin-moderation'] });
      toast.success(vars.action === 'REMOVE_CONTENT' ? 'Đã gỡ nội dung vi phạm.' : 'Đã bỏ qua báo cáo.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Không thể xử lý báo cáo.')),
  });
};

export const useAdminModerationComments = (params?: ModerationListParams) =>
  useQuery({ queryKey: ['admin-moderation', 'comments', params], queryFn: () => moderationApi.getComments(params) });

export const useAdminModerationQuestions = (params?: ModerationListParams) =>
  useQuery({ queryKey: ['admin-moderation', 'questions', params], queryFn: () => moderationApi.getQuestions(params) });

export const useRemoveContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, id }: { kind: 'comment' | 'question' | 'answer'; id: string }) => {
      if (kind === 'comment') return moderationApi.deleteComment(id);
      if (kind === 'question') return moderationApi.deleteQuestion(id);
      return moderationApi.deleteAnswer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-moderation'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports-pending'] });
      toast.success('Đã gỡ nội dung.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Không thể gỡ nội dung.')),
  });
};

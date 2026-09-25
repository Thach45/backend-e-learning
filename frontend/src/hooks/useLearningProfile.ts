import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { learningProfileApi, type UpdateLearningProfileBody } from '../api/learningProfile';

const KEY = ['learning-profile'];

export const useLearningProfile = (enabled = true) =>
  useQuery({ queryKey: KEY, queryFn: learningProfileApi.get, enabled, staleTime: 5 * 60_000, retry: false });

export const useUpdateLearningProfile = (opts?: { silent?: boolean }) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateLearningProfileBody) => learningProfileApi.update(body),
    onSuccess: (data) => {
      qc.setQueryData(KEY, data);
      qc.invalidateQueries({ queryKey: ['recommendations'] });
      if (!opts?.silent) toast.success('Đã lưu hồ sơ học tập.');
    },
    onError: () => toast.error('Không thể lưu hồ sơ học tập. Vui lòng kiểm tra lại thông tin.'),
  });
};

export const useSkipOnboarding = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: learningProfileApi.skip,
    onSuccess: (data) => qc.setQueryData(KEY, data),
  });
};

export const useRecommendations = (enabled: boolean, limit = 8) =>
  useQuery({
    queryKey: ['recommendations', limit],
    queryFn: () => learningProfileApi.recommendations(limit),
    enabled,
    staleTime: 5 * 60_000,
    retry: false,
  });

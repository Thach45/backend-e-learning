import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { instructorsApi, type UpdateInstructorProfileBody } from '../api/instructors';
import { useAuthStatus } from './useAuthStatus';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

export const useInstructorPublicProfile = (id: string | undefined) => {
  return useQuery({
    queryKey: ['instructors', id],
    queryFn: () => instructorsApi.getPublicProfile(id as string),
    enabled: !!id,
  });
};

export const useInstructorFollowStatus = (instructorId: string | undefined) => {
  const { isAuthenticated } = useAuthStatus();
  return useQuery({
    queryKey: ['instructors', instructorId, 'follow-status'],
    queryFn: () => instructorsApi.getFollowStatus(instructorId as string),
    enabled: !!instructorId && isAuthenticated,
  });
};

export const useFollowInstructor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (instructorId: string) => instructorsApi.follow(instructorId),
    onSuccess: (_, instructorId) => {
      queryClient.invalidateQueries({ queryKey: ['instructors', instructorId] });
      toast.success('Đã theo dõi giảng viên.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể theo dõi giảng viên này.'));
    },
  });
};

export const useUnfollowInstructor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (instructorId: string) => instructorsApi.unfollow(instructorId),
    onSuccess: (_, instructorId) => {
      queryClient.invalidateQueries({ queryKey: ['instructors', instructorId] });
      toast.success('Đã bỏ theo dõi giảng viên.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể bỏ theo dõi giảng viên này.'));
    },
  });
};

export const useUpdateInstructorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateInstructorProfileBody) => instructorsApi.updateMyProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      toast.success('Cập nhật hồ sơ giảng viên thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật hồ sơ giảng viên.'));
    },
  });
};

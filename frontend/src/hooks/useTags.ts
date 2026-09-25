import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { tagsApi, type TagType } from '../api/tags';

const errMsg = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

export const useTags = (params?: { q?: string; type?: TagType; limit?: number }) =>
  useQuery({ queryKey: ['tags', params], queryFn: () => tagsApi.list(params), staleTime: 60_000 });

export const useAdminTags = () => useQuery({ queryKey: ['admin-tags'], queryFn: tagsApi.listAdmin });

const useInvalidateTags = () => {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['admin-tags'] });
    qc.invalidateQueries({ queryKey: ['tags'] });
  };
};

export const useCreateTag = () => {
  const done = useInvalidateTags();
  return useMutation({
    mutationFn: tagsApi.create,
    onSuccess: () => { done(); toast.success('Đã tạo thẻ.'); },
    onError: (e) => toast.error(errMsg(e, 'Không thể tạo thẻ.')),
  });
};

export const useUpdateTag = () => {
  const done = useInvalidateTags();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof tagsApi.update>[1] }) => tagsApi.update(id, body),
    onSuccess: () => done(),
    onError: (e) => toast.error(errMsg(e, 'Không thể cập nhật thẻ.')),
  });
};

export const useDeleteTag = () => {
  const done = useInvalidateTags();
  return useMutation({
    mutationFn: tagsApi.remove,
    onSuccess: () => { done(); toast.success('Đã xoá thẻ.'); },
    onError: (e) => toast.error(errMsg(e, 'Không thể xoá thẻ.')),
  });
};

export const useSetCourseTags = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, tagIds }: { courseId: string; tagIds: string[] }) => tagsApi.setCourseTags(courseId, tagIds),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['course', v.courseId] });
      toast.success('Đã lưu thẻ kỹ năng của khóa học.');
    },
    onError: (e) => toast.error(errMsg(e, 'Không thể lưu thẻ.')),
  });
};

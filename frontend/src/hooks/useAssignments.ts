import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assignmentsApi, type AssignmentInput, type SubmissionStatus } from '../api/assignments';

const errMsg = (e: unknown, fallback: string) => {
  const m = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  return (Array.isArray(m) ? m.join(', ') : m) || fallback;
};

export const useInstructorAssignments = (courseId: string) =>
  useQuery({ queryKey: ['instructor-assignments', courseId], queryFn: () => assignmentsApi.listForInstructor(courseId), enabled: !!courseId });

export const useAssignmentSubmissions = (id: string, params?: { status?: SubmissionStatus; page?: number }) =>
  useQuery({ queryKey: ['assignment-submissions', id, params], queryFn: () => assignmentsApi.listSubmissions(id, params), enabled: !!id });

const useAssignmentMutation = <TArg, TRes>(fn: (a: TArg) => Promise<TRes>, ok: string, fail: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instructor-assignments'] });
      qc.invalidateQueries({ queryKey: ['assignment-submissions'] });
      qc.invalidateQueries({ queryKey: ['my-assignments'] });
      qc.invalidateQueries({ queryKey: ['assignment'] });
      toast.success(ok);
    },
    onError: (e) => toast.error(errMsg(e, fail)),
  });
};

export const useCreateAssignment = () =>
  useAssignmentMutation(({ courseId, body }: { courseId: string; body: AssignmentInput }) => assignmentsApi.create(courseId, body), 'Đã tạo bài tập.', 'Không thể tạo bài tập.');
export const useUpdateAssignment = () =>
  useAssignmentMutation(({ id, body }: { id: string; body: Partial<AssignmentInput> }) => assignmentsApi.update(id, body), 'Đã lưu bài tập.', 'Không thể lưu bài tập.');
export const useDeleteAssignment = () => useAssignmentMutation((id: string) => assignmentsApi.remove(id), 'Đã xoá bài tập.', 'Không thể xoá bài tập.');
export const useGradeSubmission = () =>
  useAssignmentMutation(
    ({ id, body }: { id: string; body: { score?: number; feedback?: string | null; returnForRevision?: boolean } }) => assignmentsApi.grade(id, body),
    'Đã lưu kết quả chấm.',
    'Không thể lưu kết quả chấm.',
  );

export const useMyAssignments = () => useQuery({ queryKey: ['my-assignments'], queryFn: assignmentsApi.myAssignments });
export const useAssignment = (id: string) => useQuery({ queryKey: ['assignment', id], queryFn: () => assignmentsApi.getOne(id), enabled: !!id });
export const useSubmitAssignment = () =>
  useAssignmentMutation(
    ({ id, body }: { id: string; body: { textContent?: string | null; fileUrl?: string | null; fileName?: string | null } }) => assignmentsApi.submit(id, body),
    'Đã nộp bài.',
    'Không thể nộp bài.',
  );

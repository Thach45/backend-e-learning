import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  courseContentApi,
  lessonsApi,
  type CreateCourseContentBody,
  type UpdateCourseContentBody,
  type ReorderCourseContentsBody,
  type CreateLessonBody,
  type UpdateLessonBody,
} from '../api/courseContent';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Course Content Hooks
export const useCourseContents = (courseId: string) => {
  return useQuery({
    queryKey: ['course-content', courseId],
    queryFn: () => courseContentApi.getCourseContents(courseId),
    enabled: !!courseId,
  });
};

export const useCourseContent = (courseId: string, id: string) => {
  return useQuery({
    queryKey: ['course-content', courseId, id],
    queryFn: () => courseContentApi.getCourseContentById(courseId, id),
    enabled: !!courseId && !!id,
  });
};

export const useCreateCourseContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, body }: { courseId: string; body: CreateCourseContentBody }) =>
      courseContentApi.createCourseContent(courseId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-content', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['lessons', variables.courseId] });
      toast.success('Tạo chương thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Tạo chương thất bại.'));
    },
  });
};

export const useUpdateCourseContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      id,
      body,
    }: {
      courseId: string;
      id: string;
      body: UpdateCourseContentBody;
    }) => courseContentApi.updateCourseContent(courseId, id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-content', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['lessons', variables.courseId] });
      toast.success('Cập nhật chương thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Cập nhật chương thất bại.'));
    },
  });
};

export const useDeleteCourseContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, id }: { courseId: string; id: string }) =>
      courseContentApi.deleteCourseContent(courseId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-content', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['lessons', variables.courseId] });
      toast.success('Xóa chương thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Xóa chương thất bại.'));
    },
  });
};

export const useReorderCourseContents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, body }: { courseId: string; body: ReorderCourseContentsBody }) =>
      courseContentApi.reorderCourseContents(courseId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-content', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['lessons', variables.courseId] });
      toast.success('Sắp xếp chương thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Sắp xếp chương thất bại.'));
    },
  });
};

// Lessons Hooks
export const useLessons = (courseId: string, contentId: string) => {
  return useQuery({
    queryKey: ['lessons', courseId, contentId],
    queryFn: () => lessonsApi.getLessons(courseId, contentId),
    enabled: !!courseId && !!contentId,
  });
};

export const useLesson = (courseId: string, contentId: string, id: string) => {
  return useQuery({
    queryKey: ['lessons', courseId, contentId, id],
    queryFn: () => lessonsApi.getLessonById(courseId, contentId, id),
    enabled: !!courseId && !!contentId && !!id,
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      contentId,
      body,
    }: {
      courseId: string;
      contentId: string;
      body: CreateLessonBody;
    }) => lessonsApi.createLesson(courseId, contentId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', variables.courseId, variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ['course-content', variables.courseId] });
      toast.success('Tạo bài học thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Tạo bài học thất bại.'));
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      contentId,
      id,
      body,
    }: {
      courseId: string;
      contentId: string;
      id: string;
      body: UpdateLessonBody;
    }) => lessonsApi.updateLesson(courseId, contentId, id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', variables.courseId, variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ['course-content', variables.courseId] });
      toast.success('Cập nhật bài học thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Cập nhật bài học thất bại.'));
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, contentId, id }: { courseId: string; contentId: string; id: string }) =>
      lessonsApi.deleteLesson(courseId, contentId, id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', variables.courseId, variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ['course-content', variables.courseId] });
      toast.success('Xóa bài học thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Xóa bài học thất bại.'));
    },
  });
};


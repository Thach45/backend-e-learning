import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorStudentsApi, type GetInstructorStudentsParams } from '../api/instructorStudents';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Get instructor students
export const useInstructorStudents = (params?: GetInstructorStudentsParams) => {
  return useQuery({
    queryKey: ['instructor', 'students', params],
    queryFn: () => instructorStudentsApi.getStudents(params),
  });
};

// Remove student mutation
export const useRemoveStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (enrollmentId: string) => instructorStudentsApi.removeStudent(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'students'] });
      toast.success('Đã xóa học viên khỏi khóa học.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể xóa học viên.'));
    },
  });
};

// Add student to course mutation
export const useAddStudentToCourse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ courseId, userId }: { courseId: string; userId: string }) => 
      instructorStudentsApi.addStudentToCourse(courseId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'students'] });
      toast.success('Đã thêm học viên vào khóa học.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể thêm học viên.'));
    },
  });
};


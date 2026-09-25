import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { quizzesApi, type UpsertQuizBody } from '../api/quizzes';

export const useInstructorQuiz = (lessonId: string) => {
  return useQuery({
    queryKey: ['instructor-quiz', lessonId],
    queryFn: () => quizzesApi.getQuizForInstructor(lessonId),
    enabled: !!lessonId,
  });
};

export const useUpsertQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, body }: { lessonId: string; body: UpsertQuizBody }) =>
      quizzesApi.upsertQuiz(lessonId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-quiz', variables.lessonId] });
    },
  });
};

export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId }: { lessonId: string }) => quizzesApi.deleteQuiz(lessonId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['instructor-quiz', variables.lessonId] });
    },
  });
};

export const useStudentQuiz = (lessonId: string) => {
  return useQuery({
    queryKey: ['student-quiz', lessonId],
    queryFn: () => quizzesApi.getQuizForStudent(lessonId),
    enabled: !!lessonId,
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, answers }: { lessonId: string; answers: { questionId: string; optionId: string }[] }) =>
      quizzesApi.submitQuiz(lessonId, answers),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts', variables.lessonId] });
    },
  });
};

export const useQuizAttempts = (lessonId: string) => {
  return useQuery({
    queryKey: ['quiz-attempts', lessonId],
    queryFn: () => quizzesApi.getAttempts(lessonId),
    enabled: !!lessonId,
  });
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonQuestionsApi } from '../api/lessonQuestions';

export const useLessonQuestions = (lessonId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['lesson-questions', lessonId, page, limit],
    queryFn: () => lessonQuestionsApi.getQuestions(lessonId, page, limit),
    enabled: !!lessonId,
  });
};

export const useCreateLessonQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, title, content }: { lessonId: string; title: string; content: string }) =>
      lessonQuestionsApi.createQuestion(lessonId, title, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-questions', variables.lessonId] });
    },
  });
};

export const useCreateLessonAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, content }: { questionId: string; content: string; lessonId: string }) =>
      lessonQuestionsApi.createAnswer(questionId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-questions', variables.lessonId] });
    },
  });
};

export const useResolveLessonQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId }: { questionId: string; lessonId: string }) =>
      lessonQuestionsApi.resolveQuestion(questionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-questions', variables.lessonId] });
    },
  });
};

export const useDeleteLessonQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId }: { questionId: string; lessonId: string }) =>
      lessonQuestionsApi.deleteQuestion(questionId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-questions', variables.lessonId] });
    },
  });
};

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseSurveyApi, type SubmitSurveyBody } from '../api/courseSurvey';

export const useMySurvey = (courseId: string) => {
  return useQuery({
    queryKey: ['course-survey', courseId],
    queryFn: () => courseSurveyApi.getMySurvey(courseId),
    enabled: !!courseId,
  });
};

export const useSubmitSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, body }: { courseId: string; body: SubmitSurveyBody }) =>
      courseSurveyApi.submitSurvey(courseId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['course-survey', variables.courseId] });
    },
  });
};

export const useSurveyResults = (courseId: string) => {
  return useQuery({
    queryKey: ['course-survey-results', courseId],
    queryFn: () => courseSurveyApi.getSurveyResults(courseId),
    enabled: !!courseId,
  });
};

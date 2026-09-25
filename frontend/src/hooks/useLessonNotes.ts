import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessonNotesApi } from '../api/lessonNotes';

export const useLessonNotes = (lessonId: string) => {
  return useQuery({
    queryKey: ['lesson-notes', lessonId],
    queryFn: () => lessonNotesApi.getNotes(lessonId),
    enabled: !!lessonId,
  });
};

export const useCreateLessonNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, content, timestampSeconds }: { lessonId: string; content: string; timestampSeconds: number }) =>
      lessonNotesApi.createNote(lessonId, content, timestampSeconds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-notes', variables.lessonId] });
    },
  });
};

export const useUpdateLessonNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string; lessonId: string }) =>
      lessonNotesApi.updateNote(noteId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-notes', variables.lessonId] });
    },
  });
};

export const useDeleteLessonNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId }: { noteId: string; lessonId: string }) => lessonNotesApi.deleteNote(noteId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-notes', variables.lessonId] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  commentsApi,
  type GetCommentsParams,
  type CreateCommentBody,
  type UpdateCommentBody,
  type ReactionType,
} from '../api/comments';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Get comments by lesson
export const useCommentsByLesson = (lessonId: string, params?: Omit<GetCommentsParams, 'lessonId'>) => {
  return useQuery({
    queryKey: ['comments', 'lesson', lessonId, params],
    queryFn: () => commentsApi.getCommentsByLesson(lessonId, params),
    enabled: !!lessonId,
  });
};

// Get comment by ID
export const useComment = (lessonId: string, commentId: string) => {
  return useQuery({
    queryKey: ['comment', lessonId, commentId],
    queryFn: () => commentsApi.getCommentById(lessonId, commentId),
    enabled: !!lessonId && !!commentId,
  });
};

// Create comment mutation
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ lessonId, body }: { lessonId: string; body: CreateCommentBody }) => 
      commentsApi.createComment(lessonId, body),
    onSuccess: (_, variables) => {
      // Invalidate comments for this lesson
      queryClient.invalidateQueries({ queryKey: ['comments', 'lesson', variables.lessonId] });
      // If it's a reply, also invalidate parent comment
      if (variables.body.parentId) {
        queryClient.invalidateQueries({ queryKey: ['comment', variables.lessonId, variables.body.parentId] });
      }
      toast.success(variables.body.parentId ? 'Đã gửi phản hồi.' : 'Đã gửi bình luận.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể gửi bình luận.'));
    },
  });
};

// Update comment mutation
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ lessonId, commentId, body }: { lessonId: string; commentId: string; body: UpdateCommentBody }) => 
      commentsApi.updateComment(lessonId, commentId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'lesson', variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ['comment', variables.lessonId, variables.commentId] });
      toast.success('Đã cập nhật bình luận.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật bình luận.'));
    },
  });
};

// Delete comment mutation
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ lessonId, commentId }: { lessonId: string; commentId: string }) => 
      commentsApi.deleteComment(lessonId, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'lesson', variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ['comment', variables.lessonId, variables.commentId] });
      toast.success('Đã xóa bình luận.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể xóa bình luận.'));
    },
  });
};

// Toggle reaction on a comment
export const useToggleReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, type }: { commentId: string; type: ReactionType; lessonId: string }) =>
      commentsApi.toggleReaction(commentId, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'lesson', variables.lessonId] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể thả cảm xúc cho bình luận này.'));
    },
  });
};

// Admin: Get all comments
export const useAdminComments = (params?: GetCommentsParams) => {
  return useQuery({
    queryKey: ['admin', 'comments', params],
    queryFn: () => commentsApi.getComments(params),
  });
};

// Admin: Update comment mutation
export const useUpdateCommentAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ lessonId, commentId, body }: { lessonId: string; commentId: string; body: UpdateCommentBody }) => 
      commentsApi.updateCommentAdmin(lessonId, commentId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'lesson', variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ['comment', variables.lessonId, variables.commentId] });
      toast.success('Đã cập nhật bình luận.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể cập nhật bình luận.'));
    },
  });
};

// Admin: Delete comment mutation
export const useDeleteCommentAdmin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ lessonId, commentId }: { lessonId: string; commentId: string }) => 
      commentsApi.deleteCommentAdmin(lessonId, commentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['comments', 'lesson', variables.lessonId] });
      queryClient.invalidateQueries({ queryKey: ['comment', variables.lessonId, variables.commentId] });
      toast.success('Đã xóa bình luận.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Không thể xóa bình luận.'));
    },
  });
};



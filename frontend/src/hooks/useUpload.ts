import { useMutation } from '@tanstack/react-query';
import { uploadApi } from '../api/upload';
import { toast } from 'sonner';

const getErrorMessage = (error: unknown, fallback: string) => {
  const maybeAxiosError = error as { response?: { data?: { message?: string } } };
  return maybeAxiosError?.response?.data?.message || fallback;
};

// Upload image mutation
export const useUploadImage = () => {
  return useMutation({
    mutationFn: (file: File) => uploadApi.uploadImage(file),
    onSuccess: () => {
      toast.success('Tải ảnh lên thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Tải ảnh lên thất bại.'));
    },
  });
};

// Upload video mutation
export const useUploadVideo = () => {
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
      uploadApi.uploadVideo(file, onProgress),
    onSuccess: () => {
      toast.success('Tải video lên thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Tải video lên thất bại.'));
    },
  });
};

// Upload file mutation (PDF, DOC, PPT, etc.)
export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) =>
      uploadApi.uploadFile(file, onProgress),
    onSuccess: () => {
      toast.success('Tải tệp lên thành công.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Tải tệp lên thất bại.'));
    },
  });
};


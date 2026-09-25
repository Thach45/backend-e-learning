import apiClient from './axios';
import axios from 'axios';


export type UploadImageResponse = {
  url: string;
  publicId: string;
};

export type UploadVideoResponse = {
  url: string;
  publicId: string;
  duration?: number;
  format?: string;
  width?: number;
  height?: number;
};

export type UploadFileResponse = {
  url: string;
  publicId: string;
  format?: string;
  bytes?: number;
  originalFilename?: string;
};

// Upload API functions
export const uploadApi = {
  // Upload image to Cloudinary
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  },

  // Upload video to Cloudflare R2 via Presigned URL
  uploadVideo: async (file: File, onProgress?: (progress: number) => void): Promise<UploadVideoResponse> => {
    // 1. Get presigned upload URL from NestJS
    const presignedRes = await apiClient.get('/upload/r2-presigned-url', {
      params: {
        fileName: file.name,
        contentType: file.type,
      },
    });
    const { presignedUrl, publicUrl, key } = presignedRes.data.data || presignedRes.data;

    // 2. Upload file directly to R2 using raw axios (WITHOUT authentication headers which break S3 signature)
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return {
      url: publicUrl,
      publicId: key,
    };
  },


  // Upload file (PDF, DOC, PPT, etc.) to Cloudinary
  uploadFile: async (file: File, onProgress?: (progress: number) => void): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data.data || response.data;
  },

  // Trigger R2 HLS processing
  processVideo: async (lessonId: string, videoUrl: string, isTranslate: boolean): Promise<any> => {
    const response = await apiClient.post('/upload/r2-process-video', {
      lessonId,
      videoUrl,
      isTranslate,
    });
    return response.data;
  },
};


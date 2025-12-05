import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: MulterFile,
    folder: string = 'accessories',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const location = process.env.CLOUDINARY_FOLDER_NAME + '/' + folder;
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: location,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  async uploadVideo(
    file: MulterFile,
    folder: string = 'videos',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const location = process.env.CLOUDINARY_FOLDER_NAME + '/' + folder;
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: location,
          resource_type: 'video',
          allowed_formats: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
          chunk_size: 6000000, // 6MB chunks for large files
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteVideo(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  }
}


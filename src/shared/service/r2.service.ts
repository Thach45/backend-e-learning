import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';


interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class R2Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicDomain: string;
  private readonly logger = new Logger(R2Service.name);

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    this.bucketName = process.env.R2_BUCKET_NAME || 'elearning-videos';
    this.publicDomain = process.env.R2_PUBLIC_DOMAIN || '';

    this.s3Client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
      },
      region: 'auto',
    });
  }

  async uploadFile(
    file: MulterFile,
    folder: string = 'documents',
  ): Promise<{ url: string; key: string }> {
    const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const key = `lessons/${folder}/${filename}`.replace(/\/+/g, '/');

    try {
      this.logger.log(`Uploading file ${file.originalname} to R2 bucket: ${this.bucketName}...`);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const url = `${this.publicDomain}/${key}`.replace(/([^:]\/)\/+/g, '$1');
      this.logger.log(`Successfully uploaded file to R2! Key: ${key}`);

      return { url, key };
    } catch (error) {
      this.logger.error(`Failed uploading file to R2: ${error.message}`, error.stack);
      throw error;
    }
  }

  async uploadVideo(
    file: MulterFile,
    folder: string = 'videos',
  ): Promise<{ url: string; key: string }> {
    return this.uploadFile(file, folder);
  }

  async deleteFile(key: string): Promise<void> {
    try {
      this.logger.log(`Deleting file from R2. Key: ${key}...`);

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully deleted file from R2! Key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed deleting file from R2: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteVideo(key: string): Promise<void> {
    return this.deleteFile(key);
  }

  async getPresignedUploadUrl(
    fileName: string,
    contentType: string,
    folder: string = 'raw-videos',
  ): Promise<{ presignedUrl: string; key: string; publicUrl: string }> {
    const filename = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    const key = `lessons/${folder}/${filename}`.replace(/\/+/g, '/');

    try {
      this.logger.log(`Generating presigned upload URL for key: ${key}...`);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      // Link has a lifetime of 15 minutes (900 seconds)
      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
      const publicUrl = `${this.publicDomain}/${key}`.replace(/([^:]\/)\/+/g, '$1');

      return { presignedUrl, key, publicUrl };
    } catch (error) {
      this.logger.error(`Failed generating presigned URL: ${error.message}`, error.stack);
      throw error;
    }
  }
}


import {
  Controller,
  Post,
  Get,
  Query,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpService } from '@nestjs/axios';
import { CloudinaryService } from 'src/shared/service/cloudinary.service';
import { R2Service } from 'src/shared/service/r2.service';

@Controller('api/upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly r2Service: R2Service,
    private readonly httpService: HttpService,
  ) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const result = await this.cloudinaryService.uploadImage(
      {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
      'courses',
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  @Get('r2-presigned-url')
  async getR2PresignedUrl(
    @Query('fileName') fileName: string,
    @Query('contentType') contentType: string,
  ) {
    if (!fileName || !contentType) {
      throw new BadRequestException('fileName and contentType query parameters are required.');
    }

    this.logger.log(`[R2] Requesting presigned upload URL for: ${fileName} (${contentType})`);
    const result = await this.r2Service.getPresignedUploadUrl(fileName, contentType, 'raw-videos');

    return {
      success: true,
      ...result,
    };
  }

  @Post('r2-process-video')
  async processDirectUploadedVideo(
    @Body('lessonId') lessonId: string,
    @Body('videoUrl') videoUrl: string,
    @Body('isTranslate') isTranslate?: boolean,
  ) {
    if (!lessonId || !videoUrl) {
      throw new BadRequestException('lessonId and videoUrl are required in request body.');
    }

    const fastapiUrl = process.env.FASTAPI_WORKER_URL;
    if (!fastapiUrl) {
      throw new BadRequestException('FASTAPI_WORKER_URL is not configured on this server.');
    }

    this.logger.log(
      `[FastAPI] Dispatching dubbing & HLS job for lesson ${lessonId} (isTranslate: ${!!isTranslate})...`,
    );

    await this.httpService.axiosRef.post(
      `${fastapiUrl}/process-video`,
      {
        lesson_id: lessonId,
        video_url: videoUrl,
        is_translate: !!isTranslate,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_API_SECRET ?? '',
        },
        timeout: 10000,
      },
    );

    return {
      success: true,
      message: 'AI HLS video transcoding background task successfully registered!',
      videoId: lessonId,
      videoUrl,
      isTranslate: !!isTranslate,
    };
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Validate file type (documents)
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/x-rar-compressed',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, ZIP, RAR');
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit');
    }

    const result = await this.cloudinaryService.uploadFile(
      {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
      'documents',
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      originalFilename: file.originalname,
    };
  }
}

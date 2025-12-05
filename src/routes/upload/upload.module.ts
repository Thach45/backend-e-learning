import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { CloudinaryService } from 'src/shared/service/cloudinary.service';

@Module({
  controllers: [UploadController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class UploadModule {}


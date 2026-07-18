import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UploadController } from './upload.controller';
import { CloudinaryService } from 'src/shared/service/cloudinary.service';
import { R2Service } from 'src/shared/service/r2.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
  ],
  controllers: [UploadController],
  providers: [CloudinaryService, R2Service],
  exports: [CloudinaryService, R2Service],
})
export class UploadModule {}

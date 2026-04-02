import { Module } from '@nestjs/common';
import { CourseContentController } from './course-content.controller';
import { CourseContentService } from './course-content.service';
import { CourseContentRepository } from './course-content.repo';
import { SharedModule } from 'src/shared/shared.module';
import { VideoService } from './translate-video.service';

@Module({
  imports: [SharedModule],
  controllers: [CourseContentController],
  providers: [CourseContentService, CourseContentRepository, VideoService],
})
export class CourseContentModule {}


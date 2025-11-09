import { Module } from '@nestjs/common';
import { CourseContentController } from './course-content.controller';
import { CourseContentService } from './course-content.service';
import { CourseContentRepository } from './course-content.repo';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [CourseContentController],
  providers: [CourseContentService, CourseContentRepository],
})
export class CourseContentModule {}


import { Module } from '@nestjs/common';
import { CourseDetailController } from './course-detail.controller';
import { CourseDetailService } from './course-detail.service';
import { CourseDetailRepository } from './course-detail.repo';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [CourseDetailController],
  providers: [CourseDetailService, CourseDetailRepository],
})
export class CourseDetailModule {}

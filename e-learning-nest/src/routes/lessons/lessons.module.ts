import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonsRepository } from './lessons.repo';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [LessonsController],
  providers: [LessonsService, LessonsRepository],
})
export class LessonsModule {}


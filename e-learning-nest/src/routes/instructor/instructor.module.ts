import { Module } from '@nestjs/common';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { InstructorRepo } from './instructor.repo';

@Module({
  controllers: [InstructorController],
  providers: [InstructorService, InstructorRepo],
  exports: [InstructorService],
})
export class InstructorModule {}


import { Module } from "@nestjs/common";
import { InstructorStudentsController } from "./instructor-students.controller";
import { InstructorStudentsService } from "./instructor-students.service";

@Module({
  controllers: [InstructorStudentsController],
  providers: [InstructorStudentsService],
})
export class InstructorStudentsModule {}

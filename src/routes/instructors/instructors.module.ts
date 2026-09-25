import { Module } from "@nestjs/common";
import { InstructorsController } from "./instructors.controller";
import { InstructorsService } from "./instructors.service";
import { InstructorsRepository } from "./instructors.repo";
import { SharedModule } from "src/shared/shared.module";

@Module({
  imports: [SharedModule],
  controllers: [InstructorsController],
  providers: [InstructorsService, InstructorsRepository],
})
export class InstructorsModule {}

import { Controller, Get, Param } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { Public } from "src/shared/decorator/auth.decorator";
import { InstructorsService } from "./instructors.service";
import { GetInstructorParamsDto, GetInstructorResponseDto } from "./instructors.dto";

@Controller("api/instructors")
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Public()
  @Get(":id")
  @ZodSerializerDto(GetInstructorResponseDto)
  async getPublicProfile(@Param() params: GetInstructorParamsDto) {
    return this.instructorsService.getPublicProfile((params as any).id);
  }
}

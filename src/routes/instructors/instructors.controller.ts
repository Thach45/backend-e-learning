import { Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { Public } from "src/shared/decorator/auth.decorator";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { InstructorsService } from "./instructors.service";
import { GetInstructorParamsDto, GetInstructorResponseDto, FollowInstructorResponseDto, FollowStatusResponseDto } from "./instructors.dto";

@Controller("api/instructors")
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Public()
  @Get(":id")
  @ZodSerializerDto(GetInstructorResponseDto)
  async getPublicProfile(@Param() params: GetInstructorParamsDto, @ActiveUser() user: any) {
    return this.instructorsService.getPublicProfile((params as any).id, user?.userId);
  }

  @Post(":id/follow")
  @ZodSerializerDto(FollowInstructorResponseDto)
  async follow(@Param() params: GetInstructorParamsDto, @ActiveUser() user: any) {
    return this.instructorsService.follow((params as any).id, user.userId);
  }

  @Delete(":id/follow")
  @ZodSerializerDto(FollowInstructorResponseDto)
  async unfollow(@Param() params: GetInstructorParamsDto, @ActiveUser() user: any) {
    return this.instructorsService.unfollow((params as any).id, user.userId);
  }

  @Get(":id/follow")
  @ZodSerializerDto(FollowStatusResponseDto)
  async getFollowStatus(@Param() params: GetInstructorParamsDto, @ActiveUser() user: any) {
    return this.instructorsService.getFollowStatus((params as any).id, user.userId);
  }
}

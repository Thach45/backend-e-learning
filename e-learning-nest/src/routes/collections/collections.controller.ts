import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { createZodDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Public } from "src/shared/decorator/auth.decorator";
import { OptionalAccessTokenGuard } from "src/shared/guards/optional-auth.guard";
import { CollectionsService } from "./collections.service";

const uuid = z.string().uuid();
const optText = (max: number) => z.string().trim().max(max).nullish().transform((v) => (v ? v : null));
class IdDto extends createZodDto(z.object({ id: uuid }).strict()) {}
class IdCourseDto extends createZodDto(z.object({ id: uuid, courseId: uuid }).strict()) {}
class MineQueryDto extends createZodDto(z.object({ courseId: uuid.optional() })) {}
class CreateDto extends createZodDto(z.object({ title: z.string().trim().min(1).max(100), description: optText(300), isPublic: z.boolean().default(false) }).strict()) {}
class UpdateDto extends createZodDto(z.object({ title: z.string().trim().min(1).max(100), description: optText(300), isPublic: z.boolean() }).partial().strict()) {}
class AddCourseDto extends createZodDto(z.object({ courseId: uuid }).strict()) {}

@Controller("api")
export class CollectionsController {
  constructor(private readonly service: CollectionsService) {}

  @Get("collections/mine")
  mine(@Query() q: MineQueryDto, @ActiveUser() user: any) {
    return this.service.mine(user.userId, q.courseId);
  }

  @Post("collections")
  create(@Body() b: CreateDto, @ActiveUser() user: any) {
    return this.service.create(user.userId, b as any);
  }

  @Put("collections/:id")
  update(@Param() p: IdDto, @Body() b: UpdateDto, @ActiveUser() user: any) {
    return this.service.update(p.id, user.userId, b as any);
  }

  @Delete("collections/:id")
  remove(@Param() p: IdDto, @ActiveUser() user: any) {
    return this.service.remove(p.id, user.userId);
  }

  @Post("collections/:id/courses")
  add(@Param() p: IdDto, @Body() b: AddCourseDto, @ActiveUser() user: any) {
    return this.service.addCourse(p.id, user.userId, b.courseId);
  }

  @Delete("collections/:id/courses/:courseId")
  removeCourse(@Param() p: IdCourseDto, @ActiveUser() user: any) {
    return this.service.removeCourse(p.id, user.userId, p.courseId);
  }

  // Công khai để chia sẻ liên kết; token (nếu có) chỉ dùng để nhận ra chủ sở hữu
  @Public()
  @UseGuards(OptionalAccessTokenGuard)
  @Get("collections/:id")
  detail(@Param() p: IdDto, @ActiveUser() user: any) {
    return this.service.detail(p.id, user?.userId);
  }
}

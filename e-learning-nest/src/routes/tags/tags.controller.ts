import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";
import { ActiveUser } from "src/shared/decorator/active-user.decorator";
import { Public } from "src/shared/decorator/auth.decorator";
import { Audit } from "src/shared/decorator/audit.decorator";
import { TagsService } from "./tags.service";
import {
  AdminTagItemResponseDto,
  AdminTagResponseDto,
  CourseIdParamsDto,
  CreateTagBodyDto,
  GetTagsQueryDto,
  SetCourseTagsBodyDto,
  TagIdParamsDto,
  TagResponseDto,
  UpdateTagBodyDto,
} from "./tags.dto";

@Controller("api")
export class TagsController {
  constructor(private readonly service: TagsService) {}

  @Public()
  @Get("tags")
  @ZodSerializerDto(TagResponseDto)
  list(@Query() query: GetTagsQueryDto) {
    return this.service.list(query);
  }

  @Get("admin/tags")
  @ZodSerializerDto(AdminTagItemResponseDto)
  listAdmin() {
    return this.service.listAdmin();
  }

  @Post("admin/tags")
  @Audit("tag.create", "Tag")
  @ZodSerializerDto(AdminTagResponseDto)
  create(@Body() body: CreateTagBodyDto) {
    return this.service.create(body);
  }

  @Put("admin/tags/:id")
  @Audit("tag.update", "Tag")
  @ZodSerializerDto(AdminTagResponseDto)
  update(@Param() params: TagIdParamsDto, @Body() body: UpdateTagBodyDto) {
    return this.service.update(params.id, body);
  }

  @Delete("admin/tags/:id")
  @Audit("tag.delete", "Tag")
  remove(@Param() params: TagIdParamsDto) {
    return this.service.remove(params.id);
  }

  @Put("instructor/courses/:id/tags")
  @Audit("course.tags.set", "Course")
  @ZodSerializerDto(TagResponseDto)
  setCourseTags(@Param() params: CourseIdParamsDto, @Body() body: SetCourseTagsBodyDto, @ActiveUser() user: any) {
    return this.service.setCourseTags(params.id, body.tagIds, user);
  }
}

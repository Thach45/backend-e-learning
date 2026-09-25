import { createZodDto } from "nestjs-zod";
import {
  AdminTagSchema,
  CourseIdParamsSchema,
  CreateTagBodySchema,
  GetTagsQuerySchema,
  SetCourseTagsBodySchema,
  TagIdParamsSchema,
  TagSchema,
  UpdateTagBodySchema,
} from "./tags.model";

export class GetTagsQueryDto extends createZodDto(GetTagsQuerySchema) {}
export class TagIdParamsDto extends createZodDto(TagIdParamsSchema) {}
export class CourseIdParamsDto extends createZodDto(CourseIdParamsSchema) {}
export class CreateTagBodyDto extends createZodDto(CreateTagBodySchema) {}
export class UpdateTagBodyDto extends createZodDto(UpdateTagBodySchema) {}
export class SetCourseTagsBodyDto extends createZodDto(SetCourseTagsBodySchema) {}
// nestjs-zod 4.x kiểm tra TỪNG PHẦN TỬ khi phản hồi là mảng, nên DTO mô tả một phần tử (không phải cả mảng)
export class TagResponseDto extends createZodDto(TagSchema) {}
export class AdminTagItemResponseDto extends createZodDto(AdminTagSchema) {}
export class AdminTagResponseDto extends createZodDto(AdminTagSchema.omit({ coursesCount: true, usersCount: true })) {}

import { createZodDto } from "nestjs-zod";
import {
  CourseIdParamsSchema,
  CreateAssignmentBodySchema,
  GradeBodySchema,
  IdParamsSchema,
  ListSubmissionsQuerySchema,
  SubmitBodySchema,
  UpdateAssignmentBodySchema,
} from "./assignments.model";

export class CourseIdParamsDto extends createZodDto(CourseIdParamsSchema) {}
export class IdParamsDto extends createZodDto(IdParamsSchema) {}
export class CreateAssignmentBodyDto extends createZodDto(CreateAssignmentBodySchema) {}
export class UpdateAssignmentBodyDto extends createZodDto(UpdateAssignmentBodySchema) {}
export class SubmitBodyDto extends createZodDto(SubmitBodySchema) {}
export class GradeBodyDto extends createZodDto(GradeBodySchema) {}
export class ListSubmissionsQueryDto extends createZodDto(ListSubmissionsQuerySchema) {}

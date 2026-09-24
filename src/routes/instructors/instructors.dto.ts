import { createZodDto } from "nestjs-zod";
import { GetInstructorParamsSchema, GetInstructorResponseSchema } from "./instructors.model";

export class GetInstructorParamsDto extends createZodDto(GetInstructorParamsSchema) {}
export class GetInstructorResponseDto extends createZodDto(GetInstructorResponseSchema) {}

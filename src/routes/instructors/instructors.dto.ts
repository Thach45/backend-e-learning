import { createZodDto } from "nestjs-zod";
import { GetInstructorParamsSchema, GetInstructorResponseSchema, FollowInstructorResponseSchema, FollowStatusResponseSchema } from "./instructors.model";

export class GetInstructorParamsDto extends createZodDto(GetInstructorParamsSchema) {}
export class GetInstructorResponseDto extends createZodDto(GetInstructorResponseSchema) {}
export class FollowInstructorResponseDto extends createZodDto(FollowInstructorResponseSchema) {}
export class FollowStatusResponseDto extends createZodDto(FollowStatusResponseSchema) {}

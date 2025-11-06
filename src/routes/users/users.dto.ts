import { createZodDto } from "nestjs-zod";
import { 
  CreateUserBodySchema,
  UpdateUserBodySchema,
  GetUsersQuerySchema,
  GetUserParamsSchema,
  GetUserResponseSchema,
  GetUsersResponseSchema,
  UpdateUserStatusBodySchema,
} from "./users.model";

export class CreateUserBodyDto extends createZodDto(CreateUserBodySchema) {}
export class UpdateUserBodyDto extends createZodDto(UpdateUserBodySchema) {}
export class GetUsersQueryDto extends createZodDto(GetUsersQuerySchema) {}
export class GetUserParamsDto extends createZodDto(GetUserParamsSchema) {}
export class GetUserResponseDto extends createZodDto(GetUserResponseSchema) {}
export class GetUsersResponseDto extends createZodDto(GetUsersResponseSchema) {}
export class UpdateUserStatusBodyDto extends createZodDto(UpdateUserStatusBodySchema) {}



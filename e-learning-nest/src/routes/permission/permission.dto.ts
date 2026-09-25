import { createZodDto } from "nestjs-zod";
import { CreatePermissionSchema, GetPermissionDetailResponseSchema, GetPermissionResponseSchema } from "./permission.model";

export class GetPermissionResponseDto extends createZodDto(GetPermissionResponseSchema) {}
export class GetPermissionDetailResponseDto extends createZodDto(GetPermissionDetailResponseSchema) {}  
export class CreatePermissionResponseDto extends createZodDto(CreatePermissionSchema) {}
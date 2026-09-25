import { createZodDto } from "nestjs-zod";
import {
    CreateRoleBodySchema,
    UpdateRoleBodySchema,
    RoleResponseSchema,
    GetListRolesResponseSchema,
    AssignPermissionsBodySchema,
    UnassignPermissionsBodySchema,
    AssignPermissionsResponseSchema,
} from "./roles.model";

export class CreateRoleBodyDto extends createZodDto(CreateRoleBodySchema) {}
export class UpdateRoleBodyDto extends createZodDto(UpdateRoleBodySchema) {}
export class RoleResponseDto extends createZodDto(RoleResponseSchema) {}
export class GetListRolesResponseDto extends createZodDto(GetListRolesResponseSchema) {}
export class AssignPermissionsBodyDto extends createZodDto(AssignPermissionsBodySchema) {}
export class UnassignPermissionsBodyDto extends createZodDto(UnassignPermissionsBodySchema) {}
export class AssignPermissionsResponseDto extends createZodDto(AssignPermissionsResponseSchema) {}


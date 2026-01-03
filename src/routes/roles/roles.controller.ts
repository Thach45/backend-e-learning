import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { RolesService } from './roles.service';
import { AssignPermissionsBodyDto, AssignPermissionsResponseDto, CreateRoleBodyDto, GetListRolesResponseDto, RoleResponseDto, UnassignPermissionsBodyDto, UpdateRoleBodyDto } from './roles.dto';

@Controller('api/roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}
    @Get()
    // @ZodSerializerDto(GetListRolesResponseDto)
    async listRoles() {
        console.log("listRoles");
        return this.rolesService.listRoles();
    }

    @Get(':id')
    // @ZodSerializerDto(RoleResponseDto)
    async getRole(@Param('id') id: string) {
        
        return this.rolesService.getRole(id);
    }

    @Post()
    @ZodSerializerDto(RoleResponseDto)
    async createRole(@Body() body: CreateRoleBodyDto) {
        return this.rolesService.createRole(body);
    }

    @Patch(':id')
    @ZodSerializerDto(RoleResponseDto)
    async updateRole(@Param('id') id: string, @Body() body: UpdateRoleBodyDto) {
        return this.rolesService.updateRole(id, body);
    }

    @Delete(':id')
    @ZodSerializerDto(AssignPermissionsResponseDto)
    async deleteRole(@Param('id') id: string) {
        return this.rolesService.deleteRole(id);
    }

    @Post(':id/permissions/assign')
    @ZodSerializerDto(AssignPermissionsResponseDto)
    async assignPermissions(@Param('id') id: string, @Body() body: AssignPermissionsBodyDto) {
        return this.rolesService.assignPermissions(id, (body as any).permissionIds);
    }

    @Post(':id/permissions/unassign')
    @ZodSerializerDto(AssignPermissionsResponseDto)
    async unassignPermissions(@Param('id') id: string, @Body() body: UnassignPermissionsBodyDto) {
        return this.rolesService.unassignPermissions(id, (body as any).permissionIds);
    }
}


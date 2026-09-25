import { Audit } from 'src/shared/decorator/audit.decorator';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { RolesService } from './roles.service';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import { GetIp } from 'src/shared/decorator/get-ip.decorator';
import { AuditLogService } from 'src/shared/service/audit-log.service';
import { AssignPermissionsBodyDto, AssignPermissionsResponseDto, CreateRoleBodyDto, GetListRolesResponseDto, RoleResponseDto, UnassignPermissionsBodyDto, UpdateRoleBodyDto } from './roles.dto';

@Controller('api/roles')
export class RolesController {
    constructor(
        private readonly rolesService: RolesService,
        private readonly auditLogService: AuditLogService,
    ) {}
    @Get()
    // @ZodSerializerDto(GetListRolesResponseDto)
    async listRoles() {
        return this.rolesService.listRoles();
    }

    @Get(':id')
    // @ZodSerializerDto(RoleResponseDto)
    async getRole(@Param('id') id: string) {
        
        return this.rolesService.getRole(id);
    }

    @Audit('role.create', 'Role')
    @Post()
    @ZodSerializerDto(RoleResponseDto)
    async createRole(@Body() body: CreateRoleBodyDto) {
        return this.rolesService.createRole(body);
    }

    @Audit('role.update', 'Role')
    @Patch(':id')
    @ZodSerializerDto(RoleResponseDto)
    async updateRole(@Param('id') id: string, @Body() body: UpdateRoleBodyDto) {
        return this.rolesService.updateRole(id, body);
    }

    @Audit('role.delete', 'Role')
    @Delete(':id')
    @ZodSerializerDto(AssignPermissionsResponseDto)
    async deleteRole(@Param('id') id: string) {
        return this.rolesService.deleteRole(id);
    }

    @Post(':id/permissions/assign')
    @ZodSerializerDto(AssignPermissionsResponseDto)
    async assignPermissions(
        @Param('id') id: string,
        @Body() body: AssignPermissionsBodyDto,
        @ActiveUser() user: any,
        @GetIp() ip: string,
    ) {
        const result = await this.rolesService.assignPermissions(id, (body as any).permissionIds);
        await this.auditLogService.log({
            actorId: user.userId,
            action: 'role.permissions_assign',
            targetType: 'Role',
            targetId: id,
            metadata: { permissionIds: (body as any).permissionIds },
            ipAddress: ip,
        });
        return result;
    }

    @Post(':id/permissions/unassign')
    @ZodSerializerDto(AssignPermissionsResponseDto)
    async unassignPermissions(
        @Param('id') id: string,
        @Body() body: UnassignPermissionsBodyDto,
        @ActiveUser() user: any,
        @GetIp() ip: string,
    ) {
        const result = await this.rolesService.unassignPermissions(id, (body as any).permissionIds);
        await this.auditLogService.log({
            actorId: user.userId,
            action: 'role.permissions_unassign',
            targetType: 'Role',
            targetId: id,
            metadata: { permissionIds: (body as any).permissionIds },
            ipAddress: ip,
        });
        return result;
    }
}


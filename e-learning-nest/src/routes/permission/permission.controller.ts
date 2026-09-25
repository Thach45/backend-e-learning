import { Audit } from 'src/shared/decorator/audit.decorator';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import {  CreatePermissionType, GetPermissionParamsType, GetPermissionQueryType, UpdatePermissionType } from './permission.model';
import { PermissionService } from './permission.service';
import { ZodSerializerDto } from 'nestjs-zod';
import {  GetPermissionDetailResponseDto, GetPermissionResponseDto } from './permission.dto';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';

@Controller('api/permissions')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}
    @Get()
    // @ZodSerializerDto(GetPermissionResponseDto)
    async getListPermissions(@Query() query: GetPermissionQueryType) {
        return this.permissionService.getListPermissions(query)

       
    }
    @Get(':id')
    @ZodSerializerDto(GetPermissionDetailResponseDto)
    async getPermissionById(@Param() params: GetPermissionParamsType) {
        return this.permissionService.getPermissionById(params.id)
    }
    @Audit('permission.create', 'Permission')
    @Post()
    @ZodSerializerDto(GetPermissionDetailResponseDto)
    async createPermission(@Body() body: CreatePermissionType, @ActiveUser() user: any) {
        return this.permissionService.createPermission(body, user)
    }
    @Audit('permission.update', 'Permission')
    @Put(':id')
    @ZodSerializerDto(GetPermissionDetailResponseDto)
    async updatePermission(@Param() params: GetPermissionParamsType, @Body() body: UpdatePermissionType, @ActiveUser() user: any) {
        return this.permissionService.updatePermission(params.id, body, user)
    }
    @Audit('permission.delete', 'Permission')
    @Delete(':id')
    async deletePermission(@Param() params: GetPermissionParamsType) {
        return this.permissionService.deletePermission(params.id)
    }
}

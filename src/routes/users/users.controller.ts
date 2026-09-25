import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { UsersService } from './users.service';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
import { GetIp } from 'src/shared/decorator/get-ip.decorator';
import { AuditLogService } from 'src/shared/service/audit-log.service';
import {
  CreateUserBodyDto,
  GetUserParamsDto,
  GetUsersQueryDto,
  GetUserResponseDto,
  GetUsersResponseDto,
  UpdateUserBodyDto,
  UpdateUserStatusBodyDto,
} from './users.dto';

@Controller('api')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogService: AuditLogService,
  ) {}

  // Admin routes
  @Get('admin/users')
  @ZodSerializerDto(GetUsersResponseDto)
  async getUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.getUsers(query as any);
  }

  @Get('admin/users/:id')
  @ZodSerializerDto(GetUserResponseDto)
  async getUserById(@Param() params: GetUserParamsDto) {
    return this.usersService.getUserById((params as any).id);
  }

  @Post('admin/users')
  @ZodSerializerDto(GetUserResponseDto)
  async createUser(@Body() body: CreateUserBodyDto, @ActiveUser() user: any) {
    return this.usersService.createUser(body as any, user);
  }

  @Put('admin/users/:id')
  @ZodSerializerDto(GetUserResponseDto)
  async updateUser(
    @Param() params: GetUserParamsDto,
    @Body() body: UpdateUserBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.usersService.updateUser((params as any).id, body as any, user);
  }

  @Delete('admin/users/:id')
  @ZodSerializerDto(GetUserResponseDto)
  async deleteUser(@Param() params: GetUserParamsDto, @ActiveUser() user: any, @GetIp() ip: string) {
    const result = await this.usersService.deleteUser((params as any).id);
    await this.auditLogService.log({
      actorId: user.userId,
      action: 'user.delete',
      targetType: 'User',
      targetId: (params as any).id,
      ipAddress: ip,
    });
    return result;
  }

  @Put('admin/users/:id/status')
  @ZodSerializerDto(GetUserResponseDto)
  async updateStatus(
    @Param() params: GetUserParamsDto,
    @Body() body: UpdateUserStatusBodyDto,
    @ActiveUser() user: any,
    @GetIp() ip: string,
  ) {
    const result = await this.usersService.updateUserStatus((params as any).id, body as any, user);
    await this.auditLogService.log({
      actorId: user.userId,
      action: 'user.status_change',
      targetType: 'User',
      targetId: (params as any).id,
      metadata: { status: (body as any).status },
      ipAddress: ip,
    });
    return result;
  }
}

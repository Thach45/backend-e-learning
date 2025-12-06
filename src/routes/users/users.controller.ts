import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { UsersService } from './users.service';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';
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
  constructor(private readonly usersService: UsersService) {}

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
  async deleteUser(@Param() params: GetUserParamsDto) {
    return this.usersService.deleteUser((params as any).id);
  }

  @Put('admin/users/:id/status')
  @ZodSerializerDto(GetUserResponseDto)
  async updateStatus(
    @Param() params: GetUserParamsDto,
    @Body() body: UpdateUserStatusBodyDto,
    @ActiveUser() user: any,
  ) {
    return this.usersService.updateUserStatus((params as any).id, body as any, user);
  }
}

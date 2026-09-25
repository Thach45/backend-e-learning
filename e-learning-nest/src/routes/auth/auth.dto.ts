import { createZodDto } from 'nestjs-zod'

import {
  LoginBodySchema,
  LoginResponseSchema,
  LogoutSchema,
  RefreshTokenResponseSchema,
  RefreshTokenSchema,
  RegisterBodySchema,
  RegisterResponseSchema,
  SendOtpSchema,
  ForgotPasswordSchema,
  GoogleExchangeBodySchema,
  ChangePasswordBodySchema,
  UpdateProfileBodySchema,
  MessageResponseSchema,
  RegisterResponseSchema as UserResponseSchema,
  GetDevicesResponseSchema,
  DeviceParamsSchema,
} from './auth.model'

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}

export class UserResponseDto extends createZodDto(RegisterResponseSchema) {}

export class SendOtpDto extends createZodDto(SendOtpSchema) {}

export class LoginBodyDto extends createZodDto(LoginBodySchema) {}

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}

export class RefreshTokenBodyDto extends createZodDto(RefreshTokenSchema) {}

export class RefreshTokenResponseDto extends createZodDto(RefreshTokenResponseSchema) {}

export class LogoutBodyDto extends createZodDto(LogoutSchema) {}

export class ForgotPasswordBodyDto extends createZodDto(ForgotPasswordSchema) {}

export class GoogleExchangeBodyDto extends createZodDto(GoogleExchangeBodySchema) {}

export class ChangePasswordBodyDto extends createZodDto(ChangePasswordBodySchema) {}

export class UpdateProfileBodyDto extends createZodDto(UpdateProfileBodySchema) {}

export class MessageResponseDto extends createZodDto(MessageResponseSchema) {}

export class UpdateProfileResponseDto extends createZodDto(UserResponseSchema) {}

export class GetDevicesResponseDto extends createZodDto(GetDevicesResponseSchema) {}

export class DeviceParamsDto extends createZodDto(DeviceParamsSchema) {}
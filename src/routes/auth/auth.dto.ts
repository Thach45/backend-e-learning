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
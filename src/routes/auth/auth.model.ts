import { VerificationType } from 'src/shared/constants/auth.constants'
import { z } from 'zod'

export const UserStatus = z.enum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
export type UserStatusType = z.infer<typeof UserStatus>

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  phoneNumber: z.string().min(9).max(15),
  password: z.string().min(6).max(100),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: UserStatus,
  createdAt: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  updatedAt: z.union([z.date(), z.string().transform((str) => new Date(str))]),
  deletedAt: z.date().nullable(),
  createdById: z.string().nullable(),
  updatedById: z.string().nullable(),
})
export type UserType = z.infer<typeof UserSchema>

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  name: true,
  phoneNumber: true,
  password: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
    otp: z.string().length(6),
 
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password do not match',
        path: ['confirmPassword'],
      })
    }
  })
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>

export const RegisterResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>

export const VerificationSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  type: z.nativeEnum(VerificationType),
  expiresAt: z.date(),
  createdAt: z.date(),
})
export type VerificationType = z.infer<typeof VerificationSchema>

export const SendOtpSchema = VerificationSchema.pick({
  email: true,
  type: true,
}).strict()

export type SendOtpType = z.infer<typeof SendOtpSchema>

export const LoginBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  })
  .strict()

export type LoginBodyType = z.infer<typeof LoginBodySchema>

export const LoginResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .strict()

export type LoginResponseType = z.infer<typeof LoginResponseSchema>

export const RefreshTokenSchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict()
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>

export const RefreshTokenResponseSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .strict()
export type RefreshTokenResponseType = z.infer<typeof RefreshTokenResponseSchema>

export const LogoutSchema = z.object({
  refreshToken: z.string(),
})
export type LogoutType = z.infer<typeof LogoutSchema>

export const CreateDeviceSchema = z
  .object({
    userId: z.string(),
    userAgent: z.string(),
    ipAddress: z.string(),
    lastActiveAt: z.date(),
    isActive: z.boolean(),
  })
  .strict()

export type CreateDeviceType = z.infer<typeof CreateDeviceSchema>
export const RoleSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
    createdById: z.string().nullable(),
    updatedById: z.string().nullable(),
  })
  .strict()

export type RoleType = z.infer<typeof RoleSchema>

export const GoogleLinkSchema = z.object({
  link: z.string(),
})
export type GoogleLinkType = z.infer<typeof GoogleLinkSchema>

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  password: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100),
  
}).strict().superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      message: 'Password and confirm password do not match',
      path: ['confirmPassword'],
    })
  }
})
export type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>
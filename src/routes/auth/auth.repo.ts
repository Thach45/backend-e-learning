import { Injectable, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { Device, Prisma, User, VerificationCode, VerificationType } from "@prisma/client";
import { PrismaService } from "src/shared/service/prisma.service";
import { CreateDeviceType, RoleType, UserType } from "./auth.model";

type CreateUserType = {
    email: string;
    password: string;
    name: string;
    phoneNumber: string;
    avatar?: string | null;
}
type GetOtpType = Pick<VerificationCode, "email" | "type" | "code">;
type UpdateDeviceType = {
    userAgent?: string;
    ipAddress?: string;
    lastActiveAt: Date;
    isActive: boolean;
};
type UpdateUserType = Pick<User, "password">;
type CreateOtpType = Pick<VerificationCode, "email" | "type" | "code" | "expiresAt">;

@Injectable()
export class AuthRepository {
    constructor(private readonly prisma: PrismaService) {}
    async getUserByEmailIncludeRoleAndDevice (email: string): Promise<any> {
        return (this.prisma as any).user.findUnique({
            where: {
                email: email,
            },
            include: {
                userRoles: { include: { role: true } },
            }
        });
    }
    async createUser(user: CreateUserType) {
        return (this.prisma as any).user.create({
            data: user as any,
            omit: {
                password: true,
                totpSecret: true,
            }
        });
    }
    async attachRoleToUser(userId: string, roleId: string) {
        return (this.prisma as any).userRole.create({
            data: { userId, roleId }
        });
    }
    async createRefreshToken(refreshToken: string,expiresAt: Date, userId: string, deviceId: string) {
        return this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: userId,
                deviceId: deviceId,
                expiresAt: expiresAt
            },
        });
    }
    async createDevice(device: CreateDeviceType) {
        return this.prisma.device.create({
            data: device,
        });
    }
    async getOtp(otp: GetOtpType): Promise<VerificationCode | null> {
        const verificationCode = await this.prisma.verificationCode.findUnique({
            where: {
                email_type_code: {
                    email: otp.email,
                    type: otp.type,
                    code: otp.code,
                }
            },
        });
        
        return verificationCode;
    }
    async createOtp(otp: CreateOtpType): Promise<VerificationCode> {
        //1 check exist otp
        const existOtp = await this.prisma.verificationCode.findFirst({
            where: {
                email: otp.email,
                type: otp.type,
                expiresAt: {
                    gt: new Date()
                }
            },
        });
        if(existOtp){
            throw new UnprocessableEntityException('Please wait 5 minute to send otp again');
        }
        const verificationCode = await this.prisma.verificationCode.create({
            data: otp,
        });
        return verificationCode;
    }
    async deleteOtp(email: string, type: VerificationType, code: string) {
        return this.prisma.verificationCode.delete({
            where: {
                email_type_code: {
                    email: email,
                    type: type,
                    code: code,
                }
            },
        });
    }
    async RefreshTokenIncludeRole(refreshToken: string) {
        return this.prisma.refreshToken.findUnique({
            where: {
                token: refreshToken
            },
            include: {
                user: {
                    include: {
                        userRoles: { include: { role: true } },
                    }
                }
            }
        });
    }
    async updateDevice(deviceId: string, data: UpdateDeviceType) {
        return this.prisma.device.update({
            where: { id: deviceId },
            data: data,
        });
    }
    async deleteRefreshToken(refreshToken: string) {
        return this.prisma.refreshToken.delete({
            where: { token: refreshToken },
        });
    }
    async updateUser(userId: string, data: UpdateUserType) {
        return this.prisma.user.update({
            where: { id: userId },
            data: data,
        });
    }
    async getUserById(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
           
            omit: {
                password: true,
                totpSecret: true,
            }
        });
        
    }
}
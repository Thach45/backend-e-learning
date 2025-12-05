import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { HashingService } from 'src/shared/service/hashing.service';
import { PrismaService } from 'src/shared/service/prisma.service';

import { TokenService } from 'src/shared/service/token.service';
import { Prisma, VerificationType } from '@prisma/client';
import { TokenExpiredError } from '@nestjs/jwt';

import { RoleService } from './role.service';
import { ForgotPasswordType, LoginBodyType, LogoutType, RefreshTokenType, RegisterBodyType, SendOtpType } from './auth.model';
import { AuthRepository } from './auth.repo';
import { SharedUserRepo } from 'src/shared/repositories/shared-user.repo';
import { generateOtp } from 'src/shared/helper/generate-otp';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { SendEmailService } from 'src/shared/service/send-email.service';




@Injectable()
export class AuthService {
    constructor(
        private readonly hashingService: HashingService, 
        private readonly prisma: PrismaService,
        private readonly tokenService: TokenService,
        private readonly roleService: RoleService,
        private readonly authRepository: AuthRepository,
        private readonly sharedUserRepo: SharedUserRepo,
        private readonly sendEmailService: SendEmailService
    ) {}
    async register(body: RegisterBodyType) {
        try {
            if (body.password !== body.confirmPassword) {
                throw new Error('Password and confirm password do not match');
            }
            const otp = await this.authRepository.getOtp({
                email: body.email,
                type: VerificationType.REGISTER,
                code: body.otp
            });
            if(!otp){
                throw new UnprocessableEntityException({
                    field: 'otp',
                    message: 'Invalid otp'
                    
                });
            }
            if(otp.expiresAt < new Date()){
                throw new UnprocessableEntityException({
                    field: 'otp',
                    message: 'Otp has expired'
                });
            }
            const hashedPassword = await this.hashingService.hashPassword(body.password);
            const clientRole = await this.roleService.getClientRole();
            const user = await this.authRepository.createUser({
                email: body.email,
                password: hashedPassword,
                name: body.name,
                phoneNumber: body.phoneNumber,
            });
            await this.authRepository.attachRoleToUser(user.id, clientRole);
            await this.authRepository.deleteOtp(body.email, VerificationType.REGISTER, body.otp);
            return user;
            
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'){
                throw new UnprocessableEntityException('User already exists');
            }
            if (error instanceof UnprocessableEntityException) {
                throw error; 
            }
            
        }
    }
    async sendOtp(body: SendOtpType) {
        try {
            //1 check exsit mail
            const emailExist = await this.sharedUserRepo.findUserByEmail(body.email);
           
            if(body.type === VerificationType.REGISTER && emailExist){
                throw new UnprocessableEntityException('User already exists');
            }
            if(body.type === VerificationType.FORGOT_PASSWORD && !emailExist){
                throw new UnprocessableEntityException('User not found');
            }
            const code = generateOtp();
            const expireOtp = ms(process.env.EXPIRE_OTP as unknown as number);
            console.log(expireOtp);
            const otp = await this.authRepository.createOtp({
                email: body.email,
                type: body.type,
                code,
                expiresAt: addMilliseconds(new Date(), expireOtp as unknown as number)
            });
            await this.sendEmailService.sendOtpEmail({
                recipientEmail: body.email,
                otp: code
            });
            return {
                message: 'Otp sent successfully'
            };
          
        } catch (error) {
            throw error;    
        }
        
        

        
    }

    async login(body: LoginBodyType & {userAgent: string, ipAddress: string}) {
        const user = await this.authRepository.getUserByEmailIncludeRoleAndDevice(body.email);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        const isPasswordValid = await this.hashingService.comparePassword(body.password, user.password);
        if (!isPasswordValid) {

            throw new UnprocessableEntityException({
                field: 'password',
                message: 'Invalid password'
            });
        }
        try {
            const device = await this.authRepository.createDevice({
                userId: user.id,
                userAgent: body.userAgent,
                ipAddress: body.ipAddress,
                lastActiveAt: new Date(),
                isActive: true
            });
            const primaryRole = (user as any).userRoles?.[0]?.role;
            const { accessToken, refreshToken } = await this.generateTokens(
                user.id,
                device.id,
                primaryRole?.id || "",
                primaryRole?.name || ""
            );
            return {
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw error;
        }
        
        
    }

    async generateTokens(userId: string, deviceId: string, roleId: string, roleName: string) {
        const accessToken = this.tokenService.signAccessToken({ userId, deviceId, roleId, roleName });
        const refreshToken = this.tokenService.signRefreshToken({ userId });
        const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);
        const expireRefreshToken = ms(process.env.REFRESH_TOKEN_EXPIRES_IN as unknown as number);
        await this.authRepository.createRefreshToken(
            refreshToken, 
            addMilliseconds(new Date(), expireRefreshToken as unknown as number),
            userId, 
            deviceId);
  
        return {
            accessToken,
            refreshToken
        };
    }

    async refreshToken(body: RefreshTokenType & {userAgent: string, ipAddress: string}) {
        try {
            // Check if refresh token exists
            if (!body.refreshToken) {
                throw new UnauthorizedException('Refresh token is required');
            }

            //1. Check if refresh token is valid
            const decodedRefreshToken = await this.tokenService.verifyRefreshToken(body.refreshToken);
            if(!decodedRefreshToken){
                throw new UnauthorizedException('Invalid refresh token');
            }
            // 2. Check if refresh token is in the database
            const checkRefreshToken = await this.authRepository.RefreshTokenIncludeRole(body.refreshToken);
            if(!checkRefreshToken){
                throw new UnauthorizedException('Token is revoked');
            }
            //3 update device
            await this.authRepository.updateDevice(checkRefreshToken.deviceId, {
                userAgent: body.userAgent,
                ipAddress: body.ipAddress,
                lastActiveAt: new Date(),
                isActive: true
            });
        //    3. delete the refresh token from the database
           await this.authRepository.deleteRefreshToken(body.refreshToken);
           
           // 4. generate new tokens
            const primaryRole = (checkRefreshToken.user as any).userRoles?.[0]?.role;
            const { accessToken, refreshToken } = await this.generateTokens(
                decodedRefreshToken.userId,
                 checkRefreshToken.deviceId,
                 primaryRole?.id || "",
                 primaryRole?.name || ""
                  );
            return {
                accessToken,
                refreshToken
            };
       
            
        } catch (error) {
            console.error('Refresh token error:', error);
            
            if (error instanceof TokenExpiredError) {
                throw new UnauthorizedException('Refresh token has expired');
            }
            
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new UnauthorizedException('Invalid refresh token');
            }

            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid refresh token format');
            }

            if (error.name === 'SyntaxError' && error.message.includes('Bad control character')) {
                throw new UnauthorizedException('Invalid token format - contains invalid characters');
            }

            // If it's already an UnauthorizedException, just throw it
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            // For any other unexpected errors
            console.error('Unexpected error during refresh token:', error);
            throw new UnauthorizedException('Something went wrong while processing refresh token');
        }
        
    }
    async logout(body: LogoutType) {
        try {
            const decodedRefreshToken = await this.tokenService.verifyRefreshToken(body.refreshToken);
            if(!decodedRefreshToken){
                throw new UnauthorizedException('Invalid refresh token');
            }
            const deleteRefreshToken = await this.authRepository.deleteRefreshToken(body.refreshToken);
            
            await this.authRepository.updateDevice(deleteRefreshToken.deviceId, {
                isActive: false,
                lastActiveAt: new Date(),
            });
            return {
                message: 'Logged out successfully'
            };
        } catch (error) {
            if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'){
                throw new UnauthorizedException('Not found refresh token');
            }
         
            if(error instanceof TokenExpiredError){
                throw new UnauthorizedException('Refresh token has expired');
            }
            throw new UnauthorizedException('Something went wrong');
            
        }
    }

    async forgotPassword(body: ForgotPasswordType) {
        const user = await this.sharedUserRepo.findUserByEmail(body.email);
        if(!user){
            throw new UnauthorizedException('User not found');
        }
        const otp = await this.authRepository.getOtp({
            email: body.email,
            type: VerificationType.FORGOT_PASSWORD,
            code: body.code
        });
        if(!otp){
            throw new UnprocessableEntityException({
                field: 'otp',
                message: 'Invalid otp'
                
            });
        }
        if(otp.expiresAt < new Date()){
            throw new UnprocessableEntityException({
                field: 'otp',
                message: 'Otp has expired'
            });
        }
        const hashedPassword = await this.hashingService.hashPassword(body.password);
        await this.authRepository.updateUser(user.id, {
            password: hashedPassword
        });
        await this.authRepository.deleteOtp(body.email, VerificationType.FORGOT_PASSWORD, body.code);
        return {
            message: 'Password reset successfully'
        };
    }
    async me(userId: string) {
        const user = await this.authRepository.getUserById(userId);
        console.log(user);
        if(!user){
            throw new UnauthorizedException('User not found');
        }
        return user;
        
    }
}


import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';

import { Response } from 'express';
import { ChangePasswordBodyDto, DeviceParamsDto, ForgotPasswordBodyDto, GetDevicesResponseDto, GoogleExchangeBodyDto, LoginBodyDto, LoginResponseDto, LogoutBodyDto, MessageResponseDto, RefreshTokenBodyDto, RefreshTokenResponseDto, RegisterBodyDto, SendOtpDto, UpdateProfileBodyDto, UpdateProfileResponseDto, UserResponseDto } from './auth.dto';
import { ZodSerializerDto    } from 'nestjs-zod';
import { UserAgent } from 'src/shared/decorator/user-agent.decorator';
import { GetIp } from 'src/shared/decorator/get-ip.decorator';
import { Public } from 'src/shared/decorator/auth.decorator';
import { GoogleService } from './google.service';
import { ForgotPasswordType, GoogleLinkSchema } from './auth.model';
import { ActiveUser } from 'src/shared/decorator/active-user.decorator';


@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly googleService: GoogleService) {}
    @Public()
    @Post('register')

    @ZodSerializerDto(UserResponseDto)
    async register(@Body() body: RegisterBodyDto) {
        const user = await this.authService.register(body);
        return user;
    }
    @Public()
    @Post('send-otp')
    async sendOtp(@Body() body: SendOtpDto) {
        const otp = await this.authService.sendOtp(body);
        return otp;
    }
    @Public()
    @Post('login')
    @ZodSerializerDto(LoginResponseDto)
    async login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @GetIp() ip: string) {
        const user = await this.authService.login({...body, userAgent, ipAddress: ip});
        return user;
    }

  
    @Post('refresh-token')
    @ZodSerializerDto(RefreshTokenResponseDto)
    async refreshToken(@Body() body: RefreshTokenBodyDto, @UserAgent() userAgent: string, @GetIp() ip: string) {
        const user = await this.authService.refreshToken(
            {
                ...body,
                userAgent,
                ipAddress: ip
            }
        );
        return user;
       
    }
    @Public()
    @Post("forgot-password")
    async forgotPassword(@Body() body: ForgotPasswordBodyDto) {
        const data = await this.authService.forgotPassword(body);
        return data;    
    }

    @Post('logout')
    async logout(@Body() body: LogoutBodyDto) {
        const user = await this.authService.logout(body);
        return user;
    }


    @Get('google-link')
    @Public()
    @ZodSerializerDto(GoogleLinkSchema)
    async googleLink(@UserAgent() userAgent: string, @GetIp() ip: string) {
        const link = await this.googleService.googleLink(userAgent, ip);
        return link;
    }
    @Get('google/callback')
    @Public()
    async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
        try {
            const data = await this.googleService.googleCallback(code, state);
            // Không đặt access/refresh token thật vào URL — chỉ redirect với một mã
            // one-time ngắn hạn, frontend đổi mã này lấy token thật qua POST.
            const exchangeCode = await this.googleService.createExchangeCode(data);
            res.redirect(process.env.GOOGLE_CLIENT_REDIRECT + "?code=" + exchangeCode);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error in google callback';
           res.redirect(process.env.GOOGLE_CLIENT_REDIRECT+ "?error=" + message);
        }
    }

    @Public()
    @Post('google/exchange')
    @ZodSerializerDto(LoginResponseDto)
    async googleExchange(@Body() body: GoogleExchangeBodyDto) {
        return this.googleService.consumeExchangeCode(body.code);
    }
    @Get("/me")
    // @ZodSerializerDto(UserResponseDto)
    async me(@ActiveUser() user: any) {
        const userData = await this.authService.me(user.userId);

        return userData;
    }

    @Patch("me")
    @ZodSerializerDto(UpdateProfileResponseDto)
    async updateProfile(@Body() body: UpdateProfileBodyDto, @ActiveUser() user: any) {
        return this.authService.updateProfile(user.userId, body);
    }

    @Post("change-password")
    @ZodSerializerDto(MessageResponseDto)
    async changePassword(@Body() body: ChangePasswordBodyDto, @ActiveUser() user: any) {
        return this.authService.changePassword(user.userId, body);
    }

    @Get("devices")
    @ZodSerializerDto(GetDevicesResponseDto)
    async listDevices(@ActiveUser() user: any) {
        return this.authService.listDevices(user.userId, user.deviceId);
    }

    @Delete("devices/:id")
    @ZodSerializerDto(MessageResponseDto)
    async revokeDevice(@Param() params: DeviceParamsDto, @ActiveUser() user: any) {
        return this.authService.revokeDevice((params as any).id, user.userId);
    }
}

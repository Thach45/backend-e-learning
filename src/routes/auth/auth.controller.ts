import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Get, Post, Query, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';

import { Response } from 'express';
import { ForgotPasswordBodyDto, LoginBodyDto, LoginResponseDto, LogoutBodyDto, RefreshTokenBodyDto, RefreshTokenResponseDto, RegisterBodyDto, SendOtpDto, UserResponseDto } from './auth.dto';
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
            res.redirect(process.env.GOOGLE_CLIENT_REDIRECT+ "?accessToken=" + data?.accessToken + "&refreshToken=" + data?.refreshToken);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error in google callback';
           res.redirect(process.env.GOOGLE_CLIENT_REDIRECT+ "?error=" + message);
        }
    }
    @Get("/me")
    // @ZodSerializerDto(UserResponseDto)
    async me(@ActiveUser() user: any) {
        const userData = await this.authService.me(user.userId);
        
        return userData;
    }
}

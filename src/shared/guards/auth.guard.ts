import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

import { Observable } from 'rxjs';
import { TokenService } from '../service/token.service';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccessTokenGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService) {}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean>  {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      
      throw new UnauthorizedException('No token provided');
    }
    try {
        const decoded = await this.tokenService.verifyAccessToken(token);
        request.user = decoded;
      return true;
    } catch (error) {
        
        if(error instanceof TokenExpiredError){
            throw new UnauthorizedException('Access token has expired');
        }
        if(error instanceof JsonWebTokenError){
            throw new UnauthorizedException('Invalid access token');
        }
        throw new UnauthorizedException('Invalid access token');
    }

    
    }
}

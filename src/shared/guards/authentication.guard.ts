
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';


import { TokenService } from '../service/token.service';
import { Reflector } from '@nestjs/core';
import { ApiKeyGuard } from './api-key.guard';
import { AccessTokenGuard } from './auth.guard';
import { authOptions, AuthType, Type } from '../types/auth.type';




@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService,
        private readonly reflector: Reflector,
        private readonly apiKeyGuard: ApiKeyGuard,
        private readonly accessTokenGuard: AccessTokenGuard
    ) {}  
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const authType = this.reflector.getAllAndOverride<AuthType>("auth", [
        context.getHandler(),
        context.getClass(),
      ]) || {Type: [Type.BEARER], options: authOptions.OR};
    if(authType.Type.includes(Type.PUBLIC)){
        console.log('public');
        return true;
    }
   
    if(authType.options===authOptions.OR){

        return  this.accessTokenGuard.canActivate(context) || this.apiKeyGuard.canActivate(context); 
        // ưu tiên kiểm tra access token trước tránh lỗi không thêm user vào request
    }
    if(authType.options===authOptions.AND){
        return this.apiKeyGuard.canActivate(context) && this.accessTokenGuard.canActivate(context);
    }
    return false;


    
  }

}

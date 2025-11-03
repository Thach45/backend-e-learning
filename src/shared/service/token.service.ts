import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignAccessTokenType, SignRefreshTokenType } from '../types/token.type';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
    private readonly algorithm = 'HS256';
    constructor(private readonly jwtService: JwtService) {}

    signAccessToken(payload: SignAccessTokenType) {
    
        return this.jwtService.sign({...payload, uuid: uuidv4()}, { 
            secret: process.env.ACCESS_TOKEN_SECRET, 
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
            algorithm: this.algorithm
        });
    }

    signRefreshToken(payload: SignRefreshTokenType) {
        return this.jwtService.sign({...payload, uuid: uuidv4()}, { 
            secret: process.env.REFRESH_TOKEN_SECRET, 
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
            algorithm: this.algorithm
        });
    }

    verifyAccessToken(token: string): Promise<SignAccessTokenType>  {
        return this.jwtService.verifyAsync(token, { 
            secret: process.env.ACCESS_TOKEN_SECRET,
            algorithms: [this.algorithm]
        });
    }

    verifyRefreshToken(token: string): Promise<SignRefreshTokenType> {
        return this.jwtService.verifyAsync(token, { 
            secret: process.env.REFRESH_TOKEN_SECRET,
            algorithms: [this.algorithm]
        });
    }
}

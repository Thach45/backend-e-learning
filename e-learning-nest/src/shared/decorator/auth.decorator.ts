import { SetMetadata } from "@nestjs/common";
import { authOptions, Type } from "../types/auth.type";

export const Auth=(authType: Type[], options: authOptions)=>{
    return SetMetadata('auth', {authType, options});
}

export const Public = () => SetMetadata('auth', {Type: [Type.PUBLIC], options: authOptions.OR});
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { getClientIp } from "request-ip";

export const GetIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const clientIp = getClientIp(request);
    return clientIp;

  },
);
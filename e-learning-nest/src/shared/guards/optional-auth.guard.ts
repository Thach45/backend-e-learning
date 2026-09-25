import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenService } from '../service/token.service';

/**
 * Dùng cho route @Public() muốn nhận ra người xem nếu họ có đăng nhập (ví dụ chủ sở hữu bộ sưu tập riêng tư).
 * Không bao giờ từ chối: thiếu hoặc sai token thì coi như khách (request.user để trống).
 */
@Injectable()
export class OptionalAccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        request.user = await this.tokenService.verifyAccessToken(token);
      } catch {
        // token hết hạn/không hợp lệ: xem như khách
      }
    }
    return true;
  }
}

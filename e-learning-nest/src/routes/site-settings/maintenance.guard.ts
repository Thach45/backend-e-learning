import { CanActivate, ExecutionContext, HttpException, Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { SiteSettingsService } from "./site-settings.service";

/**
 * Các đường dẫn luôn cho qua khi bảo trì:
 * - health: để giám sát biết hệ thống còn sống
 * - webhooks (SePay: tiền vào không được phép bị chặn) và webhook (video worker báo kết quả xử lý)
 * - settings/public: để giao diện biết đang bảo trì và hiển thị đúng
 * - auth: để admin đăng nhập và tắt bảo trì
 */
const ALLOWED = [
  /^\/api\/health(\/|$)/,
  /^\/api\/webhooks\//,
  /^\/api\/webhook\//,
  /^\/api\/settings\/public$/,
  /^\/api\/auth\//,
];

/**
 * Guard toàn cục: khi bật bảo trì, người không phải ADMIN nhận 503 { code: "MAINTENANCE" }.
 * Phải đặt SAU AuthenticationGuard (cần req.user) và fail-open: lỗi đọc cấu hình thì cho qua, không tự khoá cả site.
 */
@Injectable()
export class MaintenanceGuard implements CanActivate {
  private readonly logger = new Logger(MaintenanceGuard.name);

  constructor(private readonly settings: SiteSettingsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== "http") return true;
    try {
      const s = await this.settings.getSettings();
      if (!s.maintenanceEnabled) return true;

      const req = context.switchToHttp().getRequest();
      const path: string = req.path ?? String(req.url ?? "").split("?")[0];
      if (ALLOWED.some((rx) => rx.test(path))) return true;
      if (req.user?.roleName === "ADMIN") return true;

      context.switchToHttp().getResponse().setHeader("Retry-After", "300");
      throw new ServiceUnavailableException({
        statusCode: 503,
        code: "MAINTENANCE",
        message: s.maintenanceMessage || "Hệ thống đang bảo trì, vui lòng quay lại sau.",
        until: s.maintenanceUntil ? s.maintenanceUntil.toISOString() : null,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.warn(`Không đọc được trạng thái bảo trì, cho request đi tiếp: ${error}`);
      return true;
    }
  }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getClientIp } from 'request-ip';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AUDIT_KEY, AuditMeta } from '../decorator/audit.decorator';
import { AuditLogService } from '../service/audit-log.service';

const SENSITIVE_KEY = /pass(word)?|token|secret|totp/i;
const MAX_STRING_LENGTH = 200;

/** Loại bỏ trường nhạy cảm và cắt ngắn chuỗi dài trước khi lưu vào metadata. */
export function sanitizeForAudit(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH ? `${value.slice(0, MAX_STRING_LENGTH)}…` : value;
  }
  if (typeof value !== 'object') return value;
  if (depth >= 3) return '[…]';
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => sanitizeForAudit(v, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SENSITIVE_KEY.test(k) ? '[REDACTED]' : sanitizeForAudit(v, depth + 1);
  }
  return out;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.get<AuditMeta | undefined>(AUDIT_KEY, context.getHandler());
    if (!meta) return next.handle();

    const req = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap((response) => {
        const params = (req.params ?? {}) as Record<string, string>;
        const responseId =
          (response as any)?.id ?? (response as any)?.data?.id ?? undefined;
        const targetId = params[meta.idParam ?? 'id'] ?? responseId;

        // Không await: ghi log không được làm chậm hay làm hỏng response.
        void this.auditLogService.log({
          actorId: req.user?.userId,
          action: meta.action,
          targetType: meta.targetType,
          targetId: targetId ? String(targetId) : undefined,
          metadata: {
            params: sanitizeForAudit(params),
            body: sanitizeForAudit(req.body),
          } as Record<string, unknown>,
          ipAddress: getClientIp(req) ?? undefined,
        });
      }),
    );
  }
}

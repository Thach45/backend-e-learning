import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit-meta';

export type AuditMeta = {
  action: string;
  targetType: string;
  /** Tên route param chứa id đối tượng (mặc định: "id"). Nếu không có sẽ thử lấy id trong response. */
  idParam?: string;
};

/**
 * Gắn lên handler để tự động ghi audit log sau khi handler chạy thành công.
 * Ví dụ: @Audit('review.delete', 'Review', { idParam: 'reviewId' })
 */
export const Audit = (action: string, targetType: string, options?: { idParam?: string }) =>
  SetMetadata(AUDIT_KEY, { action, targetType, idParam: options?.idParam } satisfies AuditMeta);

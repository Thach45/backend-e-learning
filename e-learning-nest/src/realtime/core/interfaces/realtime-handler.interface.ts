
import { RealtimeEvent } from './realtime-event.interface';

export interface RealtimeHandler {
  /** Handler này xử lý được loại event nào */
  supports(event: RealtimeEvent): boolean;

  /** Logic xử lý chính (gọi service domain, lưu DB, bắn ra client, ...) */
  handle(event: RealtimeEvent): Promise<void>;
}
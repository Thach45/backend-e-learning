
export interface RealtimeEvent {
    /** tên sự kiện logic, ví dụ: 'notification.new', 'chat.message', 'presence.update' */
    readonly type: string;
    /** user gửi / nhận (tùy context) */
    readonly userId?: string;
    /** payload động */
    readonly payload: any;
  }
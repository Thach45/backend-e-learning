import { RealtimeEvent } from "./realtime-event.interface";

export interface RealtimeChannel {
    /** gửi đến 1 user cụ thể */
    sendToUser(userId: string, event: RealtimeEvent): Promise<void>;
  
    /** gửi đến room / topic */
    sendToRoom(room: string, event: RealtimeEvent): Promise<void>;
  }
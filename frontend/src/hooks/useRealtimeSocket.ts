import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStatus } from './useAuthStatus';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, '');

export type RealtimeEvent = {
  type: string;
  userId?: string;
  payload: unknown;
};

/** Kết nối tới namespace /realtime của backend, xác thực bằng access token hiện tại. */
export const useRealtimeSocket = (onEvent: (event: RealtimeEvent) => void) => {
  const { isAuthenticated } = useAuthStatus();
  const socketRef = useRef<Socket | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    const socket = io(`${SOCKET_URL}/realtime`, {
      auth: { token: accessToken },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('event', (event: RealtimeEvent) => {
      onEventRef.current(event);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);
};

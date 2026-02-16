/**
 * useWebSocket.ts — Singleton WebSocket connection hook.
 * Connects to WS server on app launch, sends auth token.
 * Reconnects automatically on disconnect.
 * Dispatches incoming messages to Redux chatSlice.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { appendMessage, setTyping } from '../store/chatSlice';
import { WS_URL } from '../utils/api';

let wsInstance: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export function useWebSocket() {
  const dispatch  = useAppDispatch();
  const token     = useAppSelector(s => s.auth.token);
  const wsRef     = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;
    const connect = () => {
      if (wsInstance && wsInstance.readyState !== WebSocket.CLOSED) {
        wsRef.current = wsInstance; return;
      }
      const ws = new WebSocket(WS_URL);
      wsInstance = ws;
      wsRef.current = ws;

      ws.onopen    = () => ws.send(JSON.stringify({ type: 'auth', token }));
      ws.onclose   = () => { reconnectTimer = setTimeout(connect, 3000); };
      ws.onerror   = () => ws.close();
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'new_message') dispatch(appendMessage({ channelId: msg.message.channel_id, message: msg.message }));
        if (msg.type === 'typing')      dispatch(setTyping({ channelId: msg.channelId, userId: msg.userId, isTyping: msg.isTyping }));
      };
    };
    connect();
    return () => { if (reconnectTimer) clearTimeout(reconnectTimer); };
  }, [token]);

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { ws: wsRef.current, send };
}

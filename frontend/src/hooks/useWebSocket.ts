import { useEffect, useRef, useState, useCallback } from 'react';
import type { LiveUpdate } from '../types/api';

export function useWebSocket(autoConnect = false) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<LiveUpdate | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/ws/live`);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const data: LiveUpdate = JSON.parse(event.data);
        if ('error' in data || 'status' in data) return;
        setLatestUpdate(data);
        setUpdates((prev) => [...prev.slice(-299), data]);
      } catch {
        // ignore parse errors
      }
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, []);

  useEffect(() => {
    if (autoConnect) connect();
    return () => disconnect();
  }, [autoConnect, connect, disconnect]);

  return { connected, updates, latestUpdate, connect, disconnect };
}

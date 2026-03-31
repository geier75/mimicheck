import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { mapTelemetryToNotification } from './events';

const NotificationCtx = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notif) => {
    const n = {
      id: notif.id || `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title: notif.title || 'Benachrichtigung',
      message: notif.message || '',
      type: notif.type || 'info',
      created_at: notif.created_at || new Date().toISOString(),
      read: false,
      meta: notif.meta || {},
    };
    setNotifications((prev) => [n, ...prev].slice(0, 50));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  // Bridge: listen to telemetry CustomEvent if available
  useEffect(() => {
    function onTelemetry(ev) {
      const mapped = mapTelemetryToNotification(ev);
      if (mapped) {
        addNotification({
          id: mapped.id,
          title: mapped.title,
          message: mapped.message,
          type: mapped.type,
          meta: mapped.meta,
          created_at: mapped.created_at,
        });
      }
    }
    window.addEventListener('telemetry', onTelemetry);
    return () => window.removeEventListener('telemetry', onTelemetry);
  }, [addNotification]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const value = useMemo(() => ({ notifications, unreadCount, addNotification, markAsRead, clearAll }), [notifications, unreadCount, addNotification, markAsRead, clearAll]);

  return <NotificationCtx.Provider value={value}>{children}</NotificationCtx.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationCtx);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

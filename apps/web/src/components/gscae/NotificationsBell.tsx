"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

const POLL_INTERVAL_MS = 60_000;

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/gscae/notifications?pageSize=10");

      if (!response.ok) return;

      const data: NotificationsResponse = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      /* silent fail on polling */
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/gscae/notifications/${id}`, {
        method: "PATCH",
      });

      if (!response.ok) return;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      /* silent */
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/gscae/notifications/read-all", {
        method: "PATCH",
      });

      if (!response.ok) return;

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      /* silent */
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);

    if (diffMin < 1) return "Agora";
    if (diffMin < 60) return `${diffMin}min`;

    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h`;

    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`}
        className="relative flex items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
      >
        <Bell size={20} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-border-light bg-background shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
            <h3 className="text-sm font-semibold text-text-primary">
              Notificações
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={isLoading}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-75 transition-opacity disabled:opacity-50"
              >
                <CheckCheck size={14} aria-hidden="true" />
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-text-secondary">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border-light last:border-b-0 transition-colors ${
                    notification.isRead ? "bg-background" : "bg-primary/5"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug ${
                        notification.isRead
                          ? "text-text-secondary"
                          : "text-text-primary font-medium"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="mt-0.5 text-xs text-text-secondary line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[11px] text-text-secondary/60">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      aria-label="Marcar como lida"
                      className="mt-0.5 shrink-0 text-text-secondary hover:text-primary transition-colors"
                    >
                      <Check size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

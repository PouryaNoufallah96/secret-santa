"use client";

import Link from "next/link";
import { Bell, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationItem } from "./notification-item";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl: string | null;
  relatedGroupId: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  onMarkAllRead: () => void;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  loading,
  onMarkAllRead,
  onMarkAsRead,
  onClose,
}: NotificationDropdownProps) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-christmas-red" />
          <span className="font-medium">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs bg-christmas-red/10 text-christmas-red px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={onMarkAllRead}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christmas-red" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-8 text-center">
          <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                compact
                onMarkAsRead={() => onMarkAsRead(notification.id)}
                onClick={onClose}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Footer */}
      <div className="border-t px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-sm"
          asChild
          onClick={onClose}
        >
          <Link href="/notifications">
            View all notifications
            <ExternalLink className="h-3 w-3 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

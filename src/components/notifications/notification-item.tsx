"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Gift,
  Users,
  MessageSquare,
  Calendar,
  Sparkles,
  Bell,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl: string | null;
  relatedGroupId: string | null;
  isRead: boolean;
  createdAt: string | Date;
  groupName?: string | null;
}

interface NotificationItemProps {
  notification: Notification;
  compact?: boolean;
  onMarkAsRead?: () => void;
  onClick?: () => void;
}

const typeIcons: Record<string, typeof Gift> = {
  assignment_ready: Gift,
  new_member: Users,
  draw_complete: Sparkles,
  message: MessageSquare,
  reminder: Bell,
  wishlist_update: ListChecks,
  event_update: Calendar,
};

const typeColors: Record<string, string> = {
  assignment_ready: "text-christmas-red bg-christmas-red/10",
  new_member: "text-christmas-green bg-christmas-green/10",
  draw_complete: "text-christmas-gold bg-christmas-gold/10",
  message: "text-blue-500 bg-blue-500/10",
  reminder: "text-orange-500 bg-orange-500/10",
  wishlist_update: "text-purple-500 bg-purple-500/10",
  event_update: "text-pink-500 bg-pink-500/10",
};

export function NotificationItem({
  notification,
  compact = false,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || "text-gray-500 bg-gray-500/10";

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead();
    }
    if (onClick) {
      onClick();
    }
  };

  const content = (
    <div
      className={cn(
        "flex gap-3 p-3 transition-colors",
        notification.linkUrl && "hover:bg-muted/50 cursor-pointer",
        !notification.isRead && "bg-christmas-red/5"
      )}
      onClick={handleClick}
    >
      <div className={cn("p-2 rounded-lg h-fit", colorClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm",
              !notification.isRead && "font-medium"
            )}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="h-2 w-2 rounded-full bg-christmas-red flex-shrink-0 mt-1.5" />
          )}
        </div>
        {!compact && (
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>
          {notification.groupName && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground truncate">
                {notification.groupName}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (notification.linkUrl) {
    return (
      <Link href={notification.linkUrl} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

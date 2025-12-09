"use client";

import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  displayName: string;
  isMine: boolean;
}

export function MessageBubble({
  content,
  timestamp,
  displayName,
  isMine,
}: MessageBubbleProps) {
  return (
    <div
      className={cn("flex flex-col gap-1", isMine ? "items-end" : "items-start")}
    >
      <span className="text-xs text-muted-foreground px-1">{displayName}</span>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2",
          isMine
            ? "bg-christmas-red text-white rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
      </div>
      <span className="text-xs text-muted-foreground px-1">
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
      </span>
    </div>
  );
}

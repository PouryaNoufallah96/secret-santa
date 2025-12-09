"use client";

import { MessageSquare } from "lucide-react";
import { MessageBubble } from "./message-bubble";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  displayName: string;
  isMine: boolean;
}

interface MessageThreadProps {
  messages: Message[];
  emptyMessage?: string;
}

export function MessageThread({
  messages,
  emptyMessage = "No messages yet",
}: MessageThreadProps) {
  if (messages.length === 0) {
    return (
      <div className="py-12 text-center">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Sort messages by date (oldest first for display)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto px-1">
      {sortedMessages.map((message) => (
        <MessageBubble
          key={message.id}
          content={message.content}
          timestamp={message.createdAt}
          displayName={message.displayName}
          isMine={message.isMine}
        />
      ))}
    </div>
  );
}

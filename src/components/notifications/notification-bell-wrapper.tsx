"use client";

import { useSession } from "@/lib/auth-client";
import { NotificationBell } from "./notification-bell";

export function NotificationBellWrapper() {
  const { data: session, isPending } = useSession();

  // Don't render anything while loading or if not logged in
  if (isPending || !session) {
    return null;
  }

  return <NotificationBell />;
}

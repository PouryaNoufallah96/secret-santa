import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notification } from "@/lib/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  // Build query conditions
  const conditions = [eq(notification.userId, session.user.id)];
  if (unreadOnly) {
    conditions.push(eq(notification.isRead, false));
  }

  // Get notifications for the user
  const notifications = await db
    .select()
    .from(notification)
    .where(and(...conditions))
    .orderBy(desc(notification.createdAt))
    .limit(limit)
    .offset(offset);

  // Get unread count
  const [unreadResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notification)
    .where(
      and(eq(notification.userId, session.user.id), eq(notification.isRead, false))
    );

  const unreadCount = Number(unreadResult?.count || 0);

  return Response.json({
    notifications,
    unreadCount,
    hasMore: notifications.length === limit,
  });
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get("id");

  if (notificationId) {
    // Delete a specific notification
    const deleted = await db
      .delete(notification)
      .where(
        and(
          eq(notification.id, notificationId),
          eq(notification.userId, session.user.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return Response.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true });
  } else {
    // Delete all read notifications
    await db
      .delete(notification)
      .where(
        and(
          eq(notification.userId, session.user.id),
          eq(notification.isRead, true)
        )
      );

    return Response.json({ success: true });
  }
}

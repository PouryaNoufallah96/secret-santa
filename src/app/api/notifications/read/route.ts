import { headers } from "next/headers";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notification } from "@/lib/schema";

const markReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()).optional(),
  markAll: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = markReadSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { notificationIds, markAll } = parsed.data;

  if (markAll) {
    // Mark all notifications as read
    await db
      .update(notification)
      .set({ isRead: true })
      .where(
        and(
          eq(notification.userId, session.user.id),
          eq(notification.isRead, false)
        )
      );

    return Response.json({ success: true, markedAll: true });
  }

  if (notificationIds && notificationIds.length > 0) {
    // Mark specific notifications as read
    await db
      .update(notification)
      .set({ isRead: true })
      .where(
        and(
          eq(notification.userId, session.user.id),
          inArray(notification.id, notificationIds)
        )
      );

    return Response.json({ success: true, marked: notificationIds.length });
  }

  return Response.json(
    { error: "Must provide notificationIds or markAll" },
    { status: 400 }
  );
}

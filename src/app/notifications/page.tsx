import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notification, group } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCircle, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationItem } from "@/components/notifications/notification-item";

async function getNotificationsData(userId: string) {
  const notifications = await db
    .select({
      notification: notification,
      groupName: group.name,
    })
    .from(notification)
    .leftJoin(group, eq(notification.relatedGroupId, group.id))
    .where(eq(notification.userId, userId))
    .orderBy(desc(notification.createdAt))
    .limit(50);

  const [unreadResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notification)
    .where(eq(notification.userId, userId));

  return {
    notifications: notifications.map((n) => ({
      ...n.notification,
      groupName: n.groupName,
    })),
    totalCount: Number(unreadResult?.count || 0),
  };
}

export default async function NotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/");
  }

  const { notifications } = await getNotificationsData(session.user.id);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-christmas-red/10 rounded-lg">
            <Bell className="h-6 w-6 text-christmas-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <form action="/api/notifications/read" method="POST">
            <input type="hidden" name="markAll" value="true" />
            <Button variant="outline" size="sm" type="submit">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          </form>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Stay updated on your Secret Santa groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No notifications yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                When something happens in your groups, you&apos;ll see it here.
              </p>
              <Button asChild>
                <Link href="/groups">Go to Groups</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

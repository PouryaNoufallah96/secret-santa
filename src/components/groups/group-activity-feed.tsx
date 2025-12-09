"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  UserPlus,
  Shuffle,
  Calendar,
  Gift,
  RefreshCw,
  Activity,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ActivityType =
  | "member_joined"
  | "draw_completed"
  | "event_updated"
  | "wishlist_added"
  | "redraw_triggered";

interface ActivityItem {
  id: string;
  activityType: ActivityType;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  userId: string | null;
  userName: string | null;
  userImage: string | null;
}

interface GroupActivityFeedProps {
  groupId: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "member_joined":
      return <UserPlus className="h-4 w-4 text-christmas-green" />;
    case "draw_completed":
      return <Shuffle className="h-4 w-4 text-christmas-red" />;
    case "event_updated":
      return <Calendar className="h-4 w-4 text-christmas-gold" />;
    case "wishlist_added":
      return <Gift className="h-4 w-4 text-purple-500" />;
    case "redraw_triggered":
      return <RefreshCw className="h-4 w-4 text-orange-500" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function getActivityMessage(activity: ActivityItem): string {
  const userName = activity.userName || "Someone";

  switch (activity.activityType) {
    case "member_joined":
      return `${userName} joined the group`;
    case "draw_completed":
      return "Names have been drawn!";
    case "event_updated":
      return `${userName} updated the event details`;
    case "wishlist_added":
      return `${userName} added items to their wishlist`;
    case "redraw_triggered":
      return `${userName} triggered a redraw`;
    default:
      return "Activity recorded";
  }
}

export function GroupActivityFeed({ groupId }: GroupActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchActivities = useCallback(async (newOffset: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/groups/${groupId}/activity?limit=10&offset=${newOffset}`
      );
      if (!res.ok) throw new Error("Failed to fetch activities");

      const data = await res.json();

      if (newOffset === 0) {
        setActivities(data.activities);
      } else {
        setActivities((prev) => [...prev, ...data.activities]);
      }

      setHasMore(data.pagination.hasMore);
      setOffset(newOffset);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchActivities(0);
  }, [fetchActivities]);

  function loadMore() {
    fetchActivities(offset + 10);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Feed
        </CardTitle>
        <CardDescription>Recent group activity</CardDescription>
      </CardHeader>
      <CardContent>
        {loading && activities.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No activity yet
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="relative">
                  {activity.userImage ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={activity.userImage}
                        alt={activity.userName || "User"}
                      />
                      <AvatarFallback className="bg-christmas-red/10 text-christmas-red text-xs">
                        {activity.userName
                          ? getInitials(activity.userName)
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      {getActivityIcon(activity.activityType)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                    {getActivityIcon(activity.activityType)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{getActivityMessage(activity)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            ))}

            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Load more
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

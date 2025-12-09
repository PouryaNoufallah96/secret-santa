import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { groupActivity, groupMember, user } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";

// Helper to check if user is a member of the group
async function getMemberRole(groupId: string, userId: string) {
  const member = await db
    .select({ role: groupMember.role })
    .from(groupMember)
    .where(and(eq(groupMember.groupId, groupId), eq(groupMember.userId, userId)))
    .limit(1);
  return member[0]?.role || null;
}

// GET: Return activity feed for this group
export async function GET(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a member of this group
    const role = await getMemberRole(groupId, session.user.id);
    if (!role) {
      return Response.json({ error: "Not a member of this group" }, { status: 403 });
    }

    // Parse query params for pagination
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Get activity with user info
    const activities = await db
      .select({
        id: groupActivity.id,
        activityType: groupActivity.activityType,
        metadata: groupActivity.metadata,
        createdAt: groupActivity.createdAt,
        userId: groupActivity.userId,
        userName: user.name,
        userImage: user.image,
      })
      .from(groupActivity)
      .leftJoin(user, eq(groupActivity.userId, user.id))
      .where(eq(groupActivity.groupId, groupId))
      .orderBy(desc(groupActivity.createdAt))
      .limit(limit)
      .offset(offset);

    // Parse metadata JSON for each activity
    const parsedActivities = activities.map((activity) => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
    }));

    return Response.json({
      activities: parsedActivities,
      pagination: {
        limit,
        offset,
        hasMore: activities.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return Response.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}

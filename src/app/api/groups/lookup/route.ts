import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { group } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const inviteCode = url.searchParams.get("code");

    if (!inviteCode) {
      return Response.json({ error: "Invite code is required" }, { status: 400 });
    }

    // Find the group by invite code
    const [groupData] = await db
      .select({
        id: group.id,
        name: group.name,
        description: group.description,
        memberCount: sql<number>`(
          SELECT COUNT(*) FROM group_member
          WHERE group_member.group_id = ${group.id}
        )::int`,
        isArchived: group.isArchived,
        drawCompleted: group.drawCompleted,
      })
      .from(group)
      .where(eq(group.inviteCode, inviteCode.toUpperCase()))
      .limit(1);

    if (!groupData) {
      return Response.json({ error: "Invalid invite code" }, { status: 404 });
    }

    if (groupData.isArchived) {
      return Response.json(
        { error: "This group has been archived" },
        { status: 400 }
      );
    }

    if (groupData.drawCompleted) {
      return Response.json(
        { error: "Cannot join a group after the draw has been completed" },
        { status: 400 }
      );
    }

    return Response.json({
      group: {
        id: groupData.id,
        name: groupData.name,
        description: groupData.description,
        memberCount: groupData.memberCount,
      },
    });
  } catch (error) {
    console.error("Error looking up group:", error);
    return Response.json({ error: "Failed to lookup group" }, { status: 500 });
  }
}

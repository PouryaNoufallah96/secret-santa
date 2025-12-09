import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { group, groupMember, groupActivity, notification } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const joinSchema = z.object({
  inviteCode: z.string().length(8, "Invalid invite code"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = joinSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid invite code format" },
        { status: 400 }
      );
    }

    const { inviteCode } = parsed.data;

    // Get the group and verify invite code
    const [groupData] = await db
      .select()
      .from(group)
      .where(eq(group.id, groupId))
      .limit(1);

    if (!groupData) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    if (groupData.inviteCode.toUpperCase() !== inviteCode.toUpperCase()) {
      return Response.json({ error: "Invalid invite code" }, { status: 400 });
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

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(groupMember)
      .where(
        and(
          eq(groupMember.groupId, groupId),
          eq(groupMember.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return Response.json(
        { error: "You are already a member of this group" },
        { status: 400 }
      );
    }

    // Add user as a member
    const [newMember] = await db
      .insert(groupMember)
      .values({
        groupId,
        userId: session.user.id,
        role: "member",
      })
      .returning();

    // Log activity
    await db.insert(groupActivity).values({
      groupId,
      userId: session.user.id,
      activityType: "member_joined",
      metadata: JSON.stringify({ userName: session.user.name }),
    });

    // Notify group admins about new member
    const admins = await db
      .select({ userId: groupMember.userId })
      .from(groupMember)
      .where(and(eq(groupMember.groupId, groupId), eq(groupMember.role, "admin")));

    for (const admin of admins) {
      await db.insert(notification).values({
        userId: admin.userId,
        type: "new_member",
        title: "New Member Joined",
        message: `${session.user.name} has joined ${groupData.name}`,
        linkUrl: `/groups/${groupId}`,
        relatedGroupId: groupId,
      });
    }

    return Response.json(
      {
        message: "Successfully joined the group",
        member: newMember,
        group: groupData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error joining group:", error);
    return Response.json({ error: "Failed to join group" }, { status: 500 });
  }
}

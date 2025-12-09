import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { group, groupMember, user, notification } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

// Helper to check if user is a member of the group
async function getMemberRole(groupId: string, userId: string) {
  const member = await db
    .select({ role: groupMember.role })
    .from(groupMember)
    .where(and(eq(groupMember.groupId, groupId), eq(groupMember.userId, userId)))
    .limit(1);
  return member[0]?.role || null;
}

export async function GET(
  _request: Request,
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

    // Get all members with user info
    const members = await db
      .select({
        id: groupMember.id,
        userId: groupMember.userId,
        role: groupMember.role,
        joinedAt: groupMember.joinedAt,
        hasViewedAssignment: groupMember.hasViewedAssignment,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(groupMember)
      .innerJoin(user, eq(groupMember.userId, user.id))
      .where(eq(groupMember.groupId, groupId));

    return Response.json({ members });
  } catch (error) {
    console.error("Error fetching members:", error);
    return Response.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

const updateMemberSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(["admin", "member"]).optional(),
  remove: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is an admin of this group
    const currentRole = await getMemberRole(groupId, session.user.id);
    if (currentRole !== "admin") {
      return Response.json(
        { error: "Only admins can manage members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateMemberSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { memberId, role, remove } = parsed.data;

    // Get the member
    const [memberToUpdate] = await db
      .select()
      .from(groupMember)
      .where(
        and(eq(groupMember.id, memberId), eq(groupMember.groupId, groupId))
      )
      .limit(1);

    if (!memberToUpdate) {
      return Response.json({ error: "Member not found" }, { status: 404 });
    }

    // Get the group to check if draw is completed
    const [groupData] = await db
      .select()
      .from(group)
      .where(eq(group.id, groupId))
      .limit(1);

    if (groupData?.drawCompleted) {
      return Response.json(
        { error: "Cannot modify members after draw is completed" },
        { status: 400 }
      );
    }

    // Handle removal
    if (remove) {
      // Prevent removing the last admin
      if (memberToUpdate.role === "admin") {
        const adminCount = await db
          .select()
          .from(groupMember)
          .where(
            and(eq(groupMember.groupId, groupId), eq(groupMember.role, "admin"))
          );

        if (adminCount.length <= 1) {
          return Response.json(
            { error: "Cannot remove the last admin" },
            { status: 400 }
          );
        }
      }

      await db
        .delete(groupMember)
        .where(eq(groupMember.id, memberId));

      return Response.json({ message: "Member removed successfully" });
    }

    // Handle role update
    if (role) {
      // If demoting the last admin, prevent it
      if (memberToUpdate.role === "admin" && role === "member") {
        const adminCount = await db
          .select()
          .from(groupMember)
          .where(
            and(eq(groupMember.groupId, groupId), eq(groupMember.role, "admin"))
          );

        if (adminCount.length <= 1) {
          return Response.json(
            { error: "Cannot demote the last admin" },
            { status: 400 }
          );
        }
      }

      const [updatedMember] = await db
        .update(groupMember)
        .set({ role })
        .where(eq(groupMember.id, memberId))
        .returning();

      // Notify the member about role change
      await db.insert(notification).values({
        userId: memberToUpdate.userId,
        type: "event_update",
        title: role === "admin" ? "You are now an admin" : "Role updated",
        message: `Your role in ${groupData?.name} has been updated to ${role}`,
        linkUrl: `/groups/${groupId}`,
        relatedGroupId: groupId,
      });

      return Response.json({ member: updatedMember });
    }

    return Response.json({ error: "No updates provided" }, { status: 400 });
  } catch (error) {
    console.error("Error updating member:", error);
    return Response.json({ error: "Failed to update member" }, { status: 500 });
  }
}

// Allow members to leave a group
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the member record
    const [member] = await db
      .select()
      .from(groupMember)
      .where(
        and(
          eq(groupMember.groupId, groupId),
          eq(groupMember.userId, session.user.id)
        )
      )
      .limit(1);

    if (!member) {
      return Response.json({ error: "Not a member of this group" }, { status: 404 });
    }

    // Get the group to check if draw is completed
    const [groupData] = await db
      .select()
      .from(group)
      .where(eq(group.id, groupId))
      .limit(1);

    if (groupData?.drawCompleted) {
      return Response.json(
        { error: "Cannot leave a group after the draw is completed" },
        { status: 400 }
      );
    }

    // Prevent the last admin from leaving
    if (member.role === "admin") {
      const adminCount = await db
        .select()
        .from(groupMember)
        .where(
          and(eq(groupMember.groupId, groupId), eq(groupMember.role, "admin"))
        );

      if (adminCount.length <= 1) {
        return Response.json(
          { error: "As the last admin, you must promote another member before leaving" },
          { status: 400 }
        );
      }
    }

    await db
      .delete(groupMember)
      .where(
        and(
          eq(groupMember.groupId, groupId),
          eq(groupMember.userId, session.user.id)
        )
      );

    return Response.json({ message: "Successfully left the group" });
  } catch (error) {
    console.error("Error leaving group:", error);
    return Response.json({ error: "Failed to leave group" }, { status: 500 });
  }
}

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { group, groupMember, user } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  budgetMin: z.number().int().min(0).optional().nullable(),
  budgetMax: z.number().int().min(0).optional().nullable(),
  currency: z
    .enum(["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK"])
    .optional(),
  exchangeDate: z.string().optional().nullable(),
});

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

    // Get group details with member count
    const groupResult = await db
      .select({
        group: group,
        memberCount: sql<number>`(
          SELECT COUNT(*) FROM group_member
          WHERE group_member.group_id = ${group.id}
        )::int`,
      })
      .from(group)
      .where(eq(group.id, groupId))
      .limit(1);

    if (groupResult.length === 0) {
      return Response.json({ error: "Group not found" }, { status: 404 });
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

    const groupData = groupResult[0];
    if (!groupData) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    return Response.json({
      group: {
        ...groupData.group,
        memberCount: groupData.memberCount,
      },
      members,
      currentUserRole: role,
    });
  } catch (error) {
    console.error("Error fetching group:", error);
    return Response.json({ error: "Failed to fetch group" }, { status: 500 });
  }
}

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
    const role = await getMemberRole(groupId, session.user.id);
    if (role !== "admin") {
      return Response.json(
        { error: "Only admins can update group settings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateGroupSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates = parsed.data;

    // Validate budget range if both are provided
    if (updates.budgetMin !== undefined && updates.budgetMax !== undefined) {
      if (
        updates.budgetMin !== null &&
        updates.budgetMax !== null &&
        updates.budgetMin > updates.budgetMax
      ) {
        return Response.json(
          { error: "Minimum budget cannot be greater than maximum budget" },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.budgetMin !== undefined) updateData.budgetMin = updates.budgetMin;
    if (updates.budgetMax !== undefined) updateData.budgetMax = updates.budgetMax;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.exchangeDate !== undefined) {
      updateData.exchangeDate = updates.exchangeDate
        ? new Date(updates.exchangeDate)
        : null;
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json({ error: "No updates provided" }, { status: 400 });
    }

    const [updatedGroup] = await db
      .update(group)
      .set(updateData)
      .where(eq(group.id, groupId))
      .returning();

    if (!updatedGroup) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    return Response.json({ group: updatedGroup });
  } catch (error) {
    console.error("Error updating group:", error);
    return Response.json({ error: "Failed to update group" }, { status: 500 });
  }
}

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

    // Check if user is an admin of this group
    const role = await getMemberRole(groupId, session.user.id);
    if (role !== "admin") {
      return Response.json(
        { error: "Only admins can archive groups" },
        { status: 403 }
      );
    }

    // Archive the group instead of deleting
    const [archivedGroup] = await db
      .update(group)
      .set({ isArchived: true })
      .where(eq(group.id, groupId))
      .returning();

    if (!archivedGroup) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    return Response.json({ message: "Group archived successfully" });
  } catch (error) {
    console.error("Error archiving group:", error);
    return Response.json({ error: "Failed to archive group" }, { status: 500 });
  }
}

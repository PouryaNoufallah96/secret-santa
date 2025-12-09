import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { group, groupMember } from "@/lib/schema";
import { generateInviteCode } from "@/lib/secret-santa";
import { eq, and } from "drizzle-orm";
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

// GET the current invite code (any member can view)
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

    const [groupData] = await db
      .select({ inviteCode: group.inviteCode, name: group.name })
      .from(group)
      .where(eq(group.id, groupId))
      .limit(1);

    if (!groupData) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    return Response.json({
      inviteCode: groupData.inviteCode,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/groups/join?code=${groupData.inviteCode}`,
    });
  } catch (error) {
    console.error("Error fetching invite code:", error);
    return Response.json({ error: "Failed to fetch invite code" }, { status: 500 });
  }
}

// POST to regenerate the invite code (admin only)
export async function POST(
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
        { error: "Only admins can regenerate invite codes" },
        { status: 403 }
      );
    }

    // Check if the group exists and is not archived
    const [groupData] = await db
      .select()
      .from(group)
      .where(eq(group.id, groupId))
      .limit(1);

    if (!groupData) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    if (groupData.isArchived) {
      return Response.json(
        { error: "Cannot regenerate invite code for archived group" },
        { status: 400 }
      );
    }

    // Generate a unique invite code
    let newInviteCode = generateInviteCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure invite code is unique
    while (attempts < maxAttempts) {
      const existing = await db
        .select({ id: group.id })
        .from(group)
        .where(eq(group.inviteCode, newInviteCode))
        .limit(1);

      if (existing.length === 0) break;

      newInviteCode = generateInviteCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return Response.json(
        { error: "Failed to generate unique invite code" },
        { status: 500 }
      );
    }

    // Update the invite code
    const [updatedGroup] = await db
      .update(group)
      .set({ inviteCode: newInviteCode })
      .where(eq(group.id, groupId))
      .returning();

    if (!updatedGroup) {
      return Response.json({ error: "Failed to update group" }, { status: 500 });
    }

    return Response.json({
      inviteCode: updatedGroup.inviteCode,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/groups/join?code=${updatedGroup.inviteCode}`,
    });
  } catch (error) {
    console.error("Error regenerating invite code:", error);
    return Response.json(
      { error: "Failed to regenerate invite code" },
      { status: 500 }
    );
  }
}

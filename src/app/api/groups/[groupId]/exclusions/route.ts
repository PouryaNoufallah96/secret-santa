import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { exclusionRule, groupMember, user } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const createExclusionSchema = z.object({
  excludedUserId: z.string().min(1),
  reason: z.string().max(200).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupId } = await params;

  // Verify user is a member of this group
  const membership = await db
    .select()
    .from(groupMember)
    .where(
      and(
        eq(groupMember.groupId, groupId),
        eq(groupMember.userId, session.user.id)
      )
    )
    .limit(1);

  const memberRecord = membership[0];
  if (!memberRecord) {
    return Response.json({ error: "Not a member of this group" }, { status: 403 });
  }

  // Get all exclusion rules for this group with user details
  const exclusions = await db
    .select({
      id: exclusionRule.id,
      userId: exclusionRule.userId,
      excludedUserId: exclusionRule.excludedUserId,
      reason: exclusionRule.reason,
      createdAt: exclusionRule.createdAt,
      userName: user.name,
      userImage: user.image,
    })
    .from(exclusionRule)
    .innerJoin(user, eq(exclusionRule.userId, user.id))
    .where(eq(exclusionRule.groupId, groupId));

  // Get excluded user details separately
  const exclusionsWithDetails = await Promise.all(
    exclusions.map(async (ex) => {
      const [excludedUser] = await db
        .select({ name: user.name, image: user.image })
        .from(user)
        .where(eq(user.id, ex.excludedUserId))
        .limit(1);
      return {
        ...ex,
        excludedUserName: excludedUser?.name || "Unknown",
        excludedUserImage: excludedUser?.image,
      };
    })
  );

  return Response.json({ exclusions: exclusionsWithDetails });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupId } = await params;

  // Verify user is an admin of this group
  const membership = await db
    .select()
    .from(groupMember)
    .where(
      and(
        eq(groupMember.groupId, groupId),
        eq(groupMember.userId, session.user.id)
      )
    )
    .limit(1);

  const postMember = membership[0];
  if (!postMember || postMember.role !== "admin") {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createExclusionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error }, { status: 400 });
  }

  // Verify excluded user is a member of the group
  const excludedMembership = await db
    .select()
    .from(groupMember)
    .where(
      and(
        eq(groupMember.groupId, groupId),
        eq(groupMember.userId, parsed.data.excludedUserId)
      )
    )
    .limit(1);

  if (excludedMembership.length === 0) {
    return Response.json(
      { error: "Excluded user is not a member of this group" },
      { status: 400 }
    );
  }

  // Cannot exclude yourself
  if (parsed.data.excludedUserId === session.user.id) {
    return Response.json({ error: "Cannot exclude yourself" }, { status: 400 });
  }

  // Check if exclusion already exists
  const existingExclusion = await db
    .select()
    .from(exclusionRule)
    .where(
      and(
        eq(exclusionRule.groupId, groupId),
        eq(exclusionRule.userId, session.user.id),
        eq(exclusionRule.excludedUserId, parsed.data.excludedUserId)
      )
    )
    .limit(1);

  if (existingExclusion.length > 0) {
    return Response.json({ error: "Exclusion already exists" }, { status: 400 });
  }

  // Create the exclusion rule
  const [newExclusion] = await db
    .insert(exclusionRule)
    .values({
      groupId,
      userId: session.user.id,
      excludedUserId: parsed.data.excludedUserId,
      reason: parsed.data.reason,
    })
    .returning();

  return Response.json({ exclusion: newExclusion }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupId } = await params;
  const { searchParams } = new URL(request.url);
  const exclusionId = searchParams.get("exclusionId");

  if (!exclusionId) {
    return Response.json({ error: "Exclusion ID required" }, { status: 400 });
  }

  // Verify user is an admin of this group
  const membership = await db
    .select()
    .from(groupMember)
    .where(
      and(
        eq(groupMember.groupId, groupId),
        eq(groupMember.userId, session.user.id)
      )
    )
    .limit(1);

  const deleteMember = membership[0];
  if (!deleteMember || deleteMember.role !== "admin") {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  // Delete the exclusion
  await db
    .delete(exclusionRule)
    .where(
      and(eq(exclusionRule.id, exclusionId), eq(exclusionRule.groupId, groupId))
    );

  return Response.json({ success: true });
}

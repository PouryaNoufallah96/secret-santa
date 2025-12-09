import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { assignment, group, groupMember, user } from "@/lib/schema";

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
  const [membership] = await db
    .select()
    .from(groupMember)
    .where(
      and(
        eq(groupMember.groupId, groupId),
        eq(groupMember.userId, session.user.id)
      )
    )
    .limit(1);

  if (!membership) {
    return Response.json({ error: "Not a member of this group" }, { status: 403 });
  }

  // Get group details
  const [groupData] = await db
    .select()
    .from(group)
    .where(eq(group.id, groupId))
    .limit(1);

  if (!groupData) {
    return Response.json({ error: "Group not found" }, { status: 404 });
  }

  // Check if draw has been completed
  if (!groupData.drawCompleted) {
    return Response.json(
      { error: "Draw has not been completed yet", hasAssignment: false },
      { status: 200 }
    );
  }

  // Get user's assignment (who they are buying for)
  const [userAssignment] = await db
    .select({
      id: assignment.id,
      receiverUserId: assignment.receiverUserId,
      drawRound: assignment.drawRound,
      createdAt: assignment.createdAt,
      receiverName: user.name,
      receiverImage: user.image,
      receiverEmail: user.email,
    })
    .from(assignment)
    .innerJoin(user, eq(assignment.receiverUserId, user.id))
    .where(
      and(
        eq(assignment.groupId, groupId),
        eq(assignment.giverUserId, session.user.id)
      )
    )
    .limit(1);

  if (!userAssignment) {
    return Response.json(
      { error: "No assignment found", hasAssignment: false },
      { status: 200 }
    );
  }

  // Mark that user has viewed their assignment
  if (!membership.hasViewedAssignment) {
    await db
      .update(groupMember)
      .set({ hasViewedAssignment: true })
      .where(
        and(
          eq(groupMember.groupId, groupId),
          eq(groupMember.userId, session.user.id)
        )
      );
  }

  return Response.json({
    hasAssignment: true,
    hasViewed: membership.hasViewedAssignment,
    assignment: {
      id: userAssignment.id,
      drawRound: userAssignment.drawRound,
      createdAt: userAssignment.createdAt,
      recipient: {
        id: userAssignment.receiverUserId,
        name: userAssignment.receiverName,
        image: userAssignment.receiverImage,
        email: userAssignment.receiverEmail,
      },
    },
    group: {
      id: groupData.id,
      name: groupData.name,
      budgetMin: groupData.budgetMin,
      budgetMax: groupData.budgetMax,
      currency: groupData.currency,
      exchangeDate: groupData.exchangeDate,
    },
  });
}

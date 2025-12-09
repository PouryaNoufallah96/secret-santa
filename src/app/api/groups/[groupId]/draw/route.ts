import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  assignment,
  exclusionRule,
  group,
  groupActivity,
  groupMember,
  notification,
} from "@/lib/schema";
import {
  buildExclusionMap,
  generateAssignments,
  hasExchangeDatePassed,
} from "@/lib/secret-santa";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupId } = await params;

  // 1. Verify user is admin
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
  if (!memberRecord || memberRecord.role !== "admin") {
    return Response.json({ error: "Admin access required" }, { status: 403 });
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

  // Check if draw already completed
  if (groupData.drawCompleted) {
    return Response.json(
      { error: "Draw already completed. Reset the draw first to redraw." },
      { status: 400 }
    );
  }

  // 2. Get all members
  const members = await db
    .select()
    .from(groupMember)
    .where(eq(groupMember.groupId, groupId));

  if (members.length < 2) {
    return Response.json(
      { error: "Need at least 2 members to perform a draw" },
      { status: 400 }
    );
  }

  const memberIds = members.map((m) => m.userId);

  // 3. Get exclusion rules, build exclusion map
  const exclusions = await db
    .select()
    .from(exclusionRule)
    .where(eq(exclusionRule.groupId, groupId));

  const exclusionMap = buildExclusionMap(exclusions);

  // 4. Call generateAssignments()
  const assignments = generateAssignments(memberIds, exclusionMap);

  // 5. If null, return error
  if (!assignments) {
    return Response.json(
      {
        error:
          "Cannot generate valid assignments with current exclusions. Try removing some exclusion rules.",
      },
      { status: 400 }
    );
  }

  // 6. Delete any existing assignments for this group
  await db.delete(assignment).where(eq(assignment.groupId, groupId));

  // Get the current draw round
  const drawRound = groupData.drawDate
    ? (
        await db
          .select()
          .from(assignment)
          .where(eq(assignment.groupId, groupId))
          .limit(1)
      )[0]?.drawRound || 0 + 1
    : 1;

  // 7. Insert new assignments
  const assignmentData = Array.from(assignments.entries()).map(
    ([giver, receiver]) => ({
      groupId,
      giverUserId: giver,
      receiverUserId: receiver,
      drawRound,
    })
  );

  await db.insert(assignment).values(assignmentData);

  // 8. Update group.drawCompleted = true, drawDate = now
  await db
    .update(group)
    .set({
      drawCompleted: true,
      drawDate: new Date(),
    })
    .where(eq(group.id, groupId));

  // 9. Create notifications for all members
  const notificationData = memberIds.map((userId) => ({
    userId,
    type: "draw_complete" as const,
    title: "Secret Santa Draw Complete!",
    message: `The Secret Santa draw for "${groupData.name}" is complete! Click to reveal your assignment.`,
    linkUrl: `/groups/${groupId}/draw`,
    relatedGroupId: groupId,
  }));

  await db.insert(notification).values(notificationData);

  // 10. Log activity
  await db.insert(groupActivity).values({
    groupId,
    userId: session.user.id,
    activityType: "draw_completed",
    metadata: JSON.stringify({ memberCount: memberIds.length, drawRound }),
  });

  return Response.json({
    success: true,
    message: "Draw completed successfully",
    assignmentCount: assignmentData.length,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupId } = await params;

  // Verify user is admin
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

  // Get group details
  const [groupData] = await db
    .select()
    .from(group)
    .where(eq(group.id, groupId))
    .limit(1);

  if (!groupData) {
    return Response.json({ error: "Group not found" }, { status: 404 });
  }

  // Only allow reset if exchange date hasn't passed
  if (hasExchangeDatePassed(groupData.exchangeDate)) {
    return Response.json(
      { error: "Cannot reset draw after the exchange date has passed" },
      { status: 400 }
    );
  }

  // Delete assignments
  await db.delete(assignment).where(eq(assignment.groupId, groupId));

  // Reset group draw status
  await db
    .update(group)
    .set({
      drawCompleted: false,
    })
    .where(eq(group.id, groupId));

  // Reset hasViewedAssignment for all members
  await db
    .update(groupMember)
    .set({ hasViewedAssignment: false })
    .where(eq(groupMember.groupId, groupId));

  // Log activity
  await db.insert(groupActivity).values({
    groupId,
    userId: session.user.id,
    activityType: "redraw_triggered",
    metadata: JSON.stringify({ resetBy: session.user.id }),
  });

  return Response.json({
    success: true,
    message: "Draw reset successfully. You can now perform a new draw.",
  });
}

import { headers } from "next/headers";
import { and, eq, desc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  anonymousMessage,
  assignment,
  group,
  groupMember,
  notification,
} from "@/lib/schema";

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
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
    return Response.json(
      { error: "Not a member of this group" },
      { status: 403 }
    );
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

  if (!groupData.drawCompleted) {
    return Response.json(
      { error: "Draw has not been completed yet", messages: [] },
      { status: 200 }
    );
  }

  // Find the user's assignment as a giver (who they are buying for)
  const [giverAssignment] = await db
    .select()
    .from(assignment)
    .where(
      and(
        eq(assignment.groupId, groupId),
        eq(assignment.giverUserId, session.user.id)
      )
    )
    .limit(1);

  // Find the user's assignment as a receiver (who is buying for them)
  const [receiverAssignment] = await db
    .select()
    .from(assignment)
    .where(
      and(
        eq(assignment.groupId, groupId),
        eq(assignment.receiverUserId, session.user.id)
      )
    )
    .limit(1);

  if (!giverAssignment && !receiverAssignment) {
    return Response.json(
      { error: "No assignment found", messages: [] },
      { status: 200 }
    );
  }

  // Get messages for both threads (as Santa and as recipient)
  const assignmentIds: string[] = [];
  if (giverAssignment) assignmentIds.push(giverAssignment.id);
  if (receiverAssignment) assignmentIds.push(receiverAssignment.id);

  // Build messages with role context
  const allMessages = [];

  // Messages from giver thread (current user is Santa)
  if (giverAssignment) {
    const giverMessages = await db
      .select()
      .from(anonymousMessage)
      .where(eq(anonymousMessage.assignmentId, giverAssignment.id))
      .orderBy(desc(anonymousMessage.createdAt));

    for (const msg of giverMessages) {
      allMessages.push({
        ...msg,
        thread: "santa", // User is the Santa in this thread
        displayName:
          msg.senderType === "santa" ? "You" : "Your Gift Recipient",
        isMine: msg.senderType === "santa",
      });
    }
  }

  // Messages from receiver thread (current user is recipient)
  if (receiverAssignment) {
    const receiverMessages = await db
      .select()
      .from(anonymousMessage)
      .where(eq(anonymousMessage.assignmentId, receiverAssignment.id))
      .orderBy(desc(anonymousMessage.createdAt));

    for (const msg of receiverMessages) {
      allMessages.push({
        ...msg,
        thread: "recipient", // User is the recipient in this thread
        displayName:
          msg.senderType === "recipient" ? "You" : "Your Secret Santa",
        isMine: msg.senderType === "recipient",
      });
    }
  }

  // Sort all messages by creation date
  allMessages.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return Response.json({
    messages: allMessages,
    canMessageAsSanta: !!giverAssignment,
    canMessageAsRecipient: !!receiverAssignment,
    giverAssignmentId: giverAssignment?.id || null,
    receiverAssignmentId: receiverAssignment?.id || null,
  });
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

  const body = await request.json();
  const parsed = sendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { content } = parsed.data;
  const senderRole = body.senderRole as "santa" | "recipient";

  if (!senderRole || !["santa", "recipient"].includes(senderRole)) {
    return Response.json(
      { error: "Must specify senderRole as 'santa' or 'recipient'" },
      { status: 400 }
    );
  }

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
    return Response.json(
      { error: "Not a member of this group" },
      { status: 403 }
    );
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

  if (!groupData.drawCompleted) {
    return Response.json(
      { error: "Draw has not been completed yet" },
      { status: 400 }
    );
  }

  let assignmentId: string;
  let recipientUserId: string;
  let notificationTitle: string;

  if (senderRole === "santa") {
    // User is sending as Santa to their recipient
    const [giverAssignment] = await db
      .select()
      .from(assignment)
      .where(
        and(
          eq(assignment.groupId, groupId),
          eq(assignment.giverUserId, session.user.id)
        )
      )
      .limit(1);

    if (!giverAssignment) {
      return Response.json({ error: "No assignment found" }, { status: 404 });
    }

    assignmentId = giverAssignment.id;
    recipientUserId = giverAssignment.receiverUserId;
    notificationTitle = "New message from your Secret Santa!";
  } else {
    // User is sending as recipient to their Secret Santa
    const [receiverAssignment] = await db
      .select()
      .from(assignment)
      .where(
        and(
          eq(assignment.groupId, groupId),
          eq(assignment.receiverUserId, session.user.id)
        )
      )
      .limit(1);

    if (!receiverAssignment) {
      return Response.json({ error: "No assignment found" }, { status: 404 });
    }

    assignmentId = receiverAssignment.id;
    recipientUserId = receiverAssignment.giverUserId;
    notificationTitle = "New message from your gift recipient!";
  }

  // Create the message
  const [newMessage] = await db
    .insert(anonymousMessage)
    .values({
      assignmentId,
      senderType: senderRole,
      content,
    })
    .returning();

  // Create notification for the recipient
  await db.insert(notification).values({
    userId: recipientUserId,
    type: "message",
    title: notificationTitle,
    message: `You have a new anonymous message in ${groupData.name}`,
    linkUrl: `/groups/${groupId}/messages`,
    relatedGroupId: groupId,
  });

  return Response.json(
    {
      message: {
        ...newMessage,
        thread: senderRole === "santa" ? "santa" : "recipient",
        displayName: "You",
        isMine: true,
      },
    },
    { status: 201 }
  );
}

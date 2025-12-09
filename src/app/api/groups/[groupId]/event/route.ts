import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  eventDetails,
  group,
  groupActivity,
  groupMember,
  rsvp,
  user,
} from "@/lib/schema";
import { notifyEventUpdate } from "@/lib/notifications";
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

const eventSchema = z.object({
  locationName: z.string().max(200).optional().nullable(),
  locationAddress: z.string().max(500).optional().nullable(),
  virtualLink: z
    .string()
    .max(1000)
    .optional()
    .nullable()
    .refine(
      (val) => !val || val.startsWith("http://") || val.startsWith("https://"),
      { message: "Virtual link must be a valid URL" }
    ),
  eventNotes: z.string().max(1000).optional().nullable(),
});

// GET: Return event details + RSVPs with user info
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

    // Get the group info
    const [groupData] = await db
      .select({
        name: group.name,
        exchangeDate: group.exchangeDate,
      })
      .from(group)
      .where(eq(group.id, groupId))
      .limit(1);

    if (!groupData) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    // Get event details (may not exist yet)
    const [event] = await db
      .select()
      .from(eventDetails)
      .where(eq(eventDetails.groupId, groupId))
      .limit(1);

    // Get RSVPs with user info
    const rsvps = await db
      .select({
        id: rsvp.id,
        userId: rsvp.userId,
        status: rsvp.status,
        note: rsvp.note,
        updatedAt: rsvp.updatedAt,
        userName: user.name,
        userImage: user.image,
      })
      .from(rsvp)
      .innerJoin(user, eq(rsvp.userId, user.id))
      .where(eq(rsvp.groupId, groupId));

    // Get current user's RSVP status
    const currentUserRsvp = rsvps.find((r) => r.userId === session.user.id);

    return Response.json({
      event: event || null,
      exchangeDate: groupData.exchangeDate,
      groupName: groupData.name,
      rsvps,
      currentUserRsvp: currentUserRsvp || null,
      currentUserRole: role,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return Response.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

// PATCH: Update event details (admin only)
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
        { error: "Only admins can update event details" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates = parsed.data;

    // Get group info for notifications
    const [groupData] = await db
      .select({ name: group.name })
      .from(group)
      .where(eq(group.id, groupId))
      .limit(1);

    if (!groupData) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if event details already exist
    const [existingEvent] = await db
      .select()
      .from(eventDetails)
      .where(eq(eventDetails.groupId, groupId))
      .limit(1);

    let updatedEvent;
    if (existingEvent) {
      // Update existing event
      [updatedEvent] = await db
        .update(eventDetails)
        .set({
          locationName: updates.locationName,
          locationAddress: updates.locationAddress,
          virtualLink: updates.virtualLink,
          eventNotes: updates.eventNotes,
        })
        .where(eq(eventDetails.groupId, groupId))
        .returning();
    } else {
      // Create new event details
      [updatedEvent] = await db
        .insert(eventDetails)
        .values({
          groupId,
          locationName: updates.locationName,
          locationAddress: updates.locationAddress,
          virtualLink: updates.virtualLink,
          eventNotes: updates.eventNotes,
        })
        .returning();
    }

    // Log activity
    await db.insert(groupActivity).values({
      groupId,
      userId: session.user.id,
      activityType: "event_updated",
      metadata: JSON.stringify({
        updatedBy: session.user.name,
        hasLocation: !!(updates.locationName || updates.locationAddress),
        hasVirtualLink: !!updates.virtualLink,
      }),
    });

    // Get all member IDs for notifications (excluding the admin who made the update)
    const members = await db
      .select({ userId: groupMember.userId })
      .from(groupMember)
      .where(eq(groupMember.groupId, groupId));

    const memberUserIds = members
      .map((m) => m.userId)
      .filter((id) => id !== session.user.id);

    // Notify members about event update
    if (memberUserIds.length > 0) {
      await notifyEventUpdate(memberUserIds, groupId, groupData.name);
    }

    return Response.json({ event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    return Response.json({ error: "Failed to update event" }, { status: 500 });
  }
}

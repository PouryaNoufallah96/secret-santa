import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { group, groupMember, rsvp, user } from "@/lib/schema";
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

const rsvpSchema = z.object({
  status: z.enum(["attending", "not_attending", "maybe"]),
  note: z.string().max(500).optional().nullable(),
});

// GET: Return all RSVPs for this group
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

    // Get current user's RSVP
    const currentUserRsvp = rsvps.find((r) => r.userId === session.user.id);

    // Count by status
    const counts = {
      attending: rsvps.filter((r) => r.status === "attending").length,
      not_attending: rsvps.filter((r) => r.status === "not_attending").length,
      maybe: rsvps.filter((r) => r.status === "maybe").length,
    };

    return Response.json({
      rsvps,
      currentUserRsvp: currentUserRsvp || null,
      counts,
    });
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return Response.json({ error: "Failed to fetch RSVPs" }, { status: 500 });
  }
}

// POST: Create or update RSVP
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

    // Check if user is a member of this group
    const role = await getMemberRole(groupId, session.user.id);
    if (!role) {
      return Response.json({ error: "Not a member of this group" }, { status: 403 });
    }

    // Verify group exists
    const [groupData] = await db
      .select({ id: group.id })
      .from(group)
      .where(eq(group.id, groupId))
      .limit(1);

    if (!groupData) {
      return Response.json({ error: "Group not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = rsvpSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status, note } = parsed.data;

    // Check if user already has an RSVP
    const [existingRsvp] = await db
      .select()
      .from(rsvp)
      .where(and(eq(rsvp.groupId, groupId), eq(rsvp.userId, session.user.id)))
      .limit(1);

    let updatedRsvp;
    if (existingRsvp) {
      // Update existing RSVP
      [updatedRsvp] = await db
        .update(rsvp)
        .set({ status, note })
        .where(eq(rsvp.id, existingRsvp.id))
        .returning();
    } else {
      // Create new RSVP
      [updatedRsvp] = await db
        .insert(rsvp)
        .values({
          groupId,
          userId: session.user.id,
          status,
          note,
        })
        .returning();
    }

    // Return updated RSVP list
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

    const counts = {
      attending: rsvps.filter((r) => r.status === "attending").length,
      not_attending: rsvps.filter((r) => r.status === "not_attending").length,
      maybe: rsvps.filter((r) => r.status === "maybe").length,
    };

    return Response.json({
      rsvp: updatedRsvp,
      rsvps,
      counts,
    });
  } catch (error) {
    console.error("Error updating RSVP:", error);
    return Response.json({ error: "Failed to update RSVP" }, { status: 500 });
  }
}

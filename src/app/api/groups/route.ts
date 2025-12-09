import { headers } from "next/headers";
import { eq, and, sql, desc } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { group, groupMember } from "@/lib/schema";
import { generateInviteCode } from "@/lib/secret-santa";

const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  currency: z
    .enum(["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "SEK", "NOK", "DKK"])
    .default("USD"),
  exchangeDate: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all groups where user is a member
    const userGroups = await db
      .select({
        group: group,
        role: groupMember.role,
        joinedAt: groupMember.joinedAt,
        memberCount: sql<number>`(
          SELECT COUNT(*) FROM group_member
          WHERE group_member.group_id = ${group.id}
        )::int`,
      })
      .from(group)
      .innerJoin(groupMember, eq(group.id, groupMember.groupId))
      .where(
        and(eq(groupMember.userId, session.user.id), eq(group.isArchived, false))
      )
      .orderBy(desc(group.createdAt));

    // Format the response
    const formattedGroups = userGroups.map((row) => ({
      ...row.group,
      role: row.role,
      joinedAt: row.joinedAt,
      memberCount: row.memberCount,
    }));

    return Response.json({ groups: formattedGroups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return Response.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createGroupSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, budgetMin, budgetMax, currency, exchangeDate } =
      parsed.data;

    // Validate budget range
    if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
      return Response.json(
        { error: "Minimum budget cannot be greater than maximum budget" },
        { status: 400 }
      );
    }

    // Generate a unique invite code
    let inviteCode = generateInviteCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure invite code is unique
    while (attempts < maxAttempts) {
      const existing = await db
        .select({ id: group.id })
        .from(group)
        .where(eq(group.inviteCode, inviteCode))
        .limit(1);

      if (existing.length === 0) break;

      inviteCode = generateInviteCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return Response.json(
        { error: "Failed to generate unique invite code" },
        { status: 500 }
      );
    }

    // Create the group
    const [newGroup] = await db
      .insert(group)
      .values({
        name,
        description: description || null,
        budgetMin: budgetMin || null,
        budgetMax: budgetMax || null,
        currency,
        exchangeDate: exchangeDate ? new Date(exchangeDate) : null,
        inviteCode,
        createdById: session.user.id,
      })
      .returning();

    if (!newGroup) {
      return Response.json({ error: "Failed to create group" }, { status: 500 });
    }

    // Add creator as admin member
    await db.insert(groupMember).values({
      groupId: newGroup.id,
      userId: session.user.id,
      role: "admin",
    });

    return Response.json({ group: newGroup }, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return Response.json({ error: "Failed to create group" }, { status: 500 });
  }
}

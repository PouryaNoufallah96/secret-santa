import { headers } from "next/headers";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wishlistItem, groupMember } from "@/lib/schema";

const createItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  url: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  price: z.number().int().min(0).optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  groupId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("groupId");

  // Get user's wishlist items
  let items;
  if (groupId) {
    // Get items for a specific group
    items = await db
      .select()
      .from(wishlistItem)
      .where(
        and(
          eq(wishlistItem.userId, session.user.id),
          eq(wishlistItem.groupId, groupId)
        )
      )
      .orderBy(wishlistItem.createdAt);
  } else {
    // Get all items (global wishlist)
    items = await db
      .select()
      .from(wishlistItem)
      .where(
        and(
          eq(wishlistItem.userId, session.user.id),
          isNull(wishlistItem.groupId)
        )
      )
      .orderBy(wishlistItem.createdAt);
  }

  return Response.json({ items });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createItemSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // If groupId is provided, verify user is a member
  if (data.groupId) {
    const membership = await db
      .select()
      .from(groupMember)
      .where(
        and(
          eq(groupMember.groupId, data.groupId),
          eq(groupMember.userId, session.user.id)
        )
      )
      .limit(1);

    if (membership.length === 0) {
      return Response.json(
        { error: "Not a member of this group" },
        { status: 403 }
      );
    }
  }

  // Create the wishlist item
  const [newItem] = await db
    .insert(wishlistItem)
    .values({
      userId: session.user.id,
      name: data.name,
      description: data.description || null,
      url: data.url || null,
      imageUrl: data.imageUrl || null,
      price: data.price || null,
      priority: data.priority,
      groupId: data.groupId || null,
    })
    .returning();

  return Response.json({ item: newItem }, { status: 201 });
}

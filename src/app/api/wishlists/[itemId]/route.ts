import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wishlistItem } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const updateItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  url: z.string().url().optional().nullable().or(z.literal("")),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  price: z.number().int().min(0).optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;

  const [item] = await db
    .select()
    .from(wishlistItem)
    .where(eq(wishlistItem.id, itemId))
    .limit(1);

  if (!item) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  // Only owner can view full details including purchase status
  if (item.userId !== session.user.id) {
    // Return limited info for non-owners
    return Response.json({
      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        url: item.url,
        imageUrl: item.imageUrl,
        price: item.price,
        priority: item.priority,
        groupId: item.groupId,
      },
    });
  }

  return Response.json({ item });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;

  // Verify ownership
  const [existingItem] = await db
    .select()
    .from(wishlistItem)
    .where(eq(wishlistItem.id, itemId))
    .limit(1);

  if (!existingItem) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  if (existingItem.userId !== session.user.id) {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateItemSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.url !== undefined) updateData.url = data.url || null;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.priority !== undefined) updateData.priority = data.priority;

  if (Object.keys(updateData).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updatedItem] = await db
    .update(wishlistItem)
    .set(updateData)
    .where(eq(wishlistItem.id, itemId))
    .returning();

  return Response.json({ item: updatedItem });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;

  // Verify ownership
  const [existingItem] = await db
    .select()
    .from(wishlistItem)
    .where(eq(wishlistItem.id, itemId))
    .limit(1);

  if (!existingItem) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  if (existingItem.userId !== session.user.id) {
    return Response.json({ error: "Not authorized" }, { status: 403 });
  }

  await db.delete(wishlistItem).where(eq(wishlistItem.id, itemId));

  return Response.json({ success: true });
}

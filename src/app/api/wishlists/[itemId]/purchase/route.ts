import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wishlistItem, assignment } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

// Mark an item as purchased or unpurchase it
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;

  // Get the item
  const [item] = await db
    .select()
    .from(wishlistItem)
    .where(eq(wishlistItem.id, itemId))
    .limit(1);

  if (!item) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  // Cannot purchase your own item
  if (item.userId === session.user.id) {
    return Response.json(
      { error: "Cannot purchase your own wishlist item" },
      { status: 403 }
    );
  }

  // If item belongs to a group, verify user is the Secret Santa for this recipient
  if (item.groupId) {
    const [userAssignment] = await db
      .select()
      .from(assignment)
      .where(
        and(
          eq(assignment.groupId, item.groupId),
          eq(assignment.giverUserId, session.user.id),
          eq(assignment.receiverUserId, item.userId)
        )
      )
      .limit(1);

    if (!userAssignment) {
      return Response.json(
        { error: "You are not the Secret Santa for this person" },
        { status: 403 }
      );
    }
  }

  // Check if already purchased by someone else
  if (item.isPurchased && item.purchasedByUserId !== session.user.id) {
    return Response.json(
      { error: "This item has already been purchased by someone else" },
      { status: 400 }
    );
  }

  // Toggle purchase status
  const isPurchasing = !item.isPurchased || item.purchasedByUserId !== session.user.id;

  const [updatedItem] = await db
    .update(wishlistItem)
    .set({
      isPurchased: isPurchasing,
      purchasedByUserId: isPurchasing ? session.user.id : null,
      purchasedAt: isPurchasing ? new Date() : null,
    })
    .where(eq(wishlistItem.id, itemId))
    .returning();

  return Response.json({
    item: updatedItem
      ? {
          ...updatedItem,
          // Only reveal purchase info to the purchaser
          isPurchased: updatedItem.isPurchased,
          purchasedByMe: updatedItem.purchasedByUserId === session.user.id,
        }
      : null,
  });
}

// Unpurchase an item
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;

  // Get the item
  const [item] = await db
    .select()
    .from(wishlistItem)
    .where(eq(wishlistItem.id, itemId))
    .limit(1);

  if (!item) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  // Can only unpurchase items you purchased
  if (item.purchasedByUserId !== session.user.id) {
    return Response.json(
      { error: "You can only unpurchase items you have marked as purchased" },
      { status: 403 }
    );
  }

  const [updatedItem] = await db
    .update(wishlistItem)
    .set({
      isPurchased: false,
      purchasedByUserId: null,
      purchasedAt: null,
    })
    .where(eq(wishlistItem.id, itemId))
    .returning();

  return Response.json({
    item: {
      ...updatedItem,
      isPurchased: false,
      purchasedByMe: false,
    },
  });
}

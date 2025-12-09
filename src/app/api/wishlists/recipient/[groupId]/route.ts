import { headers } from "next/headers";
import { and, eq, or, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wishlistItem, assignment, user, group, userProfile } from "@/lib/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { groupId } = await params;

  // Get user's assignment for this group
  const [userAssignment] = await db
    .select()
    .from(assignment)
    .where(
      and(
        eq(assignment.groupId, groupId),
        eq(assignment.giverUserId, session.user.id)
      )
    )
    .limit(1);

  if (!userAssignment) {
    return Response.json(
      { error: "No assignment found. The draw may not have been completed yet." },
      { status: 404 }
    );
  }

  // Get group info
  const [groupData] = await db
    .select()
    .from(group)
    .where(eq(group.id, groupId))
    .limit(1);

  if (!groupData) {
    return Response.json({ error: "Group not found" }, { status: 404 });
  }

  // Get recipient user info
  const [recipientUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, userAssignment.receiverUserId))
    .limit(1);

  if (!recipientUser) {
    return Response.json({ error: "Recipient not found" }, { status: 404 });
  }

  // Get recipient profile (for interests)
  const [recipientProfile] = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userAssignment.receiverUserId))
    .limit(1);

  // Get recipient's wishlist items (group-specific AND global items)
  const items = await db
    .select()
    .from(wishlistItem)
    .where(
      and(
        eq(wishlistItem.userId, userAssignment.receiverUserId),
        or(
          eq(wishlistItem.groupId, groupId),
          isNull(wishlistItem.groupId)
        )
      )
    )
    .orderBy(wishlistItem.priority, wishlistItem.createdAt);

  // Transform items to hide sensitive purchase info
  // Only show purchase status if current user is the purchaser
  const transformedItems = items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    url: item.url,
    imageUrl: item.imageUrl,
    price: item.price,
    priority: item.priority,
    groupId: item.groupId,
    createdAt: item.createdAt,
    // Purchase status visibility:
    // - If I purchased it, show as purchased by me
    // - If someone else purchased it, show as purchased (but not by whom)
    // - If not purchased, show as not purchased
    isPurchased: item.isPurchased,
    purchasedByMe: item.purchasedByUserId === session.user.id,
    // Don't reveal who purchased it unless it's the current user
  }));

  return Response.json({
    recipient: {
      id: recipientUser.id,
      name: recipientUser.name,
      email: recipientUser.email,
      image: recipientUser.image,
      interests: recipientProfile?.interests || [],
      bio: recipientProfile?.bio || null,
    },
    group: {
      id: groupData.id,
      name: groupData.name,
      budgetMin: groupData.budgetMin,
      budgetMax: groupData.budgetMax,
      currency: groupData.currency,
      exchangeDate: groupData.exchangeDate,
    },
    items: transformedItems,
  });
}

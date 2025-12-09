import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { giftHistory, group, groupMember, user } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { headers } from "next/headers";

// GET: Return all archived groups user participated in with gift history
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all archived groups the user is a member of
    const archivedGroups = await db
      .select({
        groupId: group.id,
        groupName: group.name,
        exchangeDate: group.exchangeDate,
        currency: group.currency,
        budgetMin: group.budgetMin,
        budgetMax: group.budgetMax,
      })
      .from(groupMember)
      .innerJoin(group, eq(groupMember.groupId, group.id))
      .where(
        and(eq(groupMember.userId, session.user.id), eq(group.isArchived, true))
      )
      .orderBy(desc(group.exchangeDate));

    // Get gift history for each group
    const historyWithGifts = await Promise.all(
      archivedGroups.map(async (g) => {
        // Get what the user gave
        const [gaveGift] = await db
          .select({
            id: giftHistory.id,
            receiverUserId: giftHistory.receiverUserId,
            giftDescription: giftHistory.giftDescription,
            giftImageUrl: giftHistory.giftImageUrl,
            year: giftHistory.year,
            receiverName: user.name,
            receiverImage: user.image,
          })
          .from(giftHistory)
          .innerJoin(user, eq(giftHistory.receiverUserId, user.id))
          .where(
            and(
              eq(giftHistory.groupId, g.groupId),
              eq(giftHistory.giverUserId, session.user.id)
            )
          )
          .limit(1);

        // Get what the user received
        const [receivedGift] = await db
          .select({
            id: giftHistory.id,
            giverUserId: giftHistory.giverUserId,
            giftDescription: giftHistory.giftDescription,
            giftImageUrl: giftHistory.giftImageUrl,
            year: giftHistory.year,
            giverName: user.name,
            giverImage: user.image,
          })
          .from(giftHistory)
          .innerJoin(user, eq(giftHistory.giverUserId, user.id))
          .where(
            and(
              eq(giftHistory.groupId, g.groupId),
              eq(giftHistory.receiverUserId, session.user.id)
            )
          )
          .limit(1);

        return {
          ...g,
          year: gaveGift?.year || receivedGift?.year || new Date(g.exchangeDate || Date.now()).getFullYear(),
          gave: gaveGift
            ? {
                toName: gaveGift.receiverName,
                toImage: gaveGift.receiverImage,
                description: gaveGift.giftDescription,
                imageUrl: gaveGift.giftImageUrl,
              }
            : null,
          received: receivedGift
            ? {
                fromName: receivedGift.giverName,
                fromImage: receivedGift.giverImage,
                description: receivedGift.giftDescription,
                imageUrl: receivedGift.giftImageUrl,
              }
            : null,
        };
      })
    );

    return Response.json({ history: historyWithGifts });
  } catch (error) {
    console.error("Error fetching history:", error);
    return Response.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

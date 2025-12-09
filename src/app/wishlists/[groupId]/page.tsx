import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wishlistItem, group, groupMember } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gift, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WishlistForm } from "@/components/wishlists/wishlist-form";
import { WishlistList } from "@/components/wishlists/wishlist-list";
import { formatPrice, formatExchangeDate } from "@/lib/secret-santa";
import type { Currency } from "@/lib/types";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

async function getGroupWishlistData(groupId: string, userId: string) {
  // Get group
  const [groupData] = await db
    .select()
    .from(group)
    .where(eq(group.id, groupId))
    .limit(1);

  if (!groupData) {
    return null;
  }

  // Verify membership
  const [membership] = await db
    .select()
    .from(groupMember)
    .where(
      and(eq(groupMember.groupId, groupId), eq(groupMember.userId, userId))
    )
    .limit(1);

  if (!membership) {
    return null;
  }

  // Get user's wishlist items for this group
  const items = await db
    .select()
    .from(wishlistItem)
    .where(
      and(eq(wishlistItem.userId, userId), eq(wishlistItem.groupId, groupId))
    )
    .orderBy(wishlistItem.createdAt);

  return {
    group: groupData,
    items,
  };
}

export default async function GroupWishlistPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/");
  }

  const { groupId } = await params;
  const data = await getGroupWishlistData(groupId, session.user.id);

  if (!data) {
    notFound();
  }

  const { group: groupData, items } = data;
  const currency = groupData.currency as Currency;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/wishlists" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Wishlists
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-christmas-green/10 rounded-lg">
            <Gift className="h-6 w-6 text-christmas-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Wishlist for {groupData.name}</h1>
            <p className="text-muted-foreground">
              Items visible to your Secret Santa in this group
            </p>
          </div>
        </div>
        <WishlistForm groupId={groupId} currency={currency} />
      </div>

      {/* Group Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {(groupData.budgetMin || groupData.budgetMax) && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Budget:{" "}
                  <span className="font-medium">
                    {groupData.budgetMin && groupData.budgetMax
                      ? `${formatPrice(groupData.budgetMin * 100, currency)} - ${formatPrice(groupData.budgetMax * 100, currency)}`
                      : groupData.budgetMin
                        ? `Min ${formatPrice(groupData.budgetMin * 100, currency)}`
                        : `Max ${formatPrice(groupData.budgetMax! * 100, currency)}`}
                  </span>
                </span>
              </div>
            )}
            {groupData.exchangeDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Exchange:{" "}
                  <span className="font-medium">
                    {formatExchangeDate(new Date(groupData.exchangeDate))}
                  </span>
                </span>
              </div>
            )}
            {groupData.drawCompleted && (
              <Badge className="bg-christmas-green">Draw Complete</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Items */}
      <Card>
        <CardHeader>
          <CardTitle>Your Items</CardTitle>
          <CardDescription>
            Add gift ideas that your Secret Santa can see. Include details like
            color preferences, sizes, or links to specific products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WishlistList
            items={items}
            currency={currency}
            isOwner={true}
            emptyMessage="No items yet. Add some gift ideas for your Secret Santa!"
          />
        </CardContent>
      </Card>
    </div>
  );
}

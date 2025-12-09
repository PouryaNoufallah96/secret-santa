import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { Gift, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WishlistForm } from "@/components/wishlists/wishlist-form";
import { WishlistList } from "@/components/wishlists/wishlist-list";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wishlistItem, group, groupMember } from "@/lib/schema";

async function getWishlistData(userId: string) {
  // Get global wishlist items
  const globalItems = await db
    .select()
    .from(wishlistItem)
    .where(
      and(eq(wishlistItem.userId, userId), isNull(wishlistItem.groupId))
    )
    .orderBy(wishlistItem.createdAt);

  // Get user's groups
  const userGroups = await db
    .select({
      group: group,
      member: groupMember,
    })
    .from(groupMember)
    .innerJoin(group, eq(groupMember.groupId, group.id))
    .where(eq(groupMember.userId, userId));

  // Get wishlist items count per group
  const groupsWithCounts = await Promise.all(
    userGroups.map(async ({ group: g }) => {
      const items = await db
        .select()
        .from(wishlistItem)
        .where(
          and(eq(wishlistItem.userId, userId), eq(wishlistItem.groupId, g.id))
        );
      return {
        ...g,
        itemCount: items.length,
      };
    })
  );

  return {
    globalItems,
    groups: groupsWithCounts,
  };
}

export default async function WishlistsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/");
  }

  const { globalItems, groups } = await getWishlistData(session.user.id);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-christmas-red/10 rounded-lg">
            <Gift className="h-6 w-6 text-christmas-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Wishlists</h1>
            <p className="text-muted-foreground">Manage your gift ideas</p>
          </div>
        </div>
        <WishlistForm />
      </div>

      <Tabs defaultValue="global" className="space-y-6">
        <TabsList>
          <TabsTrigger value="global">Global Wishlist</TabsTrigger>
          <TabsTrigger value="groups">Group Wishlists</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Wishlist</CardTitle>
              <CardDescription>
                Items here are visible to all your Secret Santas across all groups.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WishlistList
                items={globalItems}
                isOwner={true}
                emptyMessage="Your global wishlist is empty. Add some gift ideas!"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          {groups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No groups yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join or create a Secret Santa group to start adding group-specific wishlists.
                </p>
                <Button asChild>
                  <Link href="/groups">Go to Groups</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {groups.map((g) => (
                <Card key={g.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-christmas-green/10 rounded-lg">
                          <Users className="h-5 w-5 text-christmas-green" />
                        </div>
                        <div>
                          <h3 className="font-medium">{g.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {g.itemCount} {g.itemCount === 1 ? "item" : "items"} in wishlist
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/wishlists/${g.id}`}>
                          View
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

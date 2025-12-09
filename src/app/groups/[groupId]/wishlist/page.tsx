import { headers } from "next/headers";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Gift, DollarSign, Calendar, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WishlistList } from "@/components/wishlists/wishlist-list";
import { auth } from "@/lib/auth";
import { formatPrice, formatExchangeDate, getInitials } from "@/lib/secret-santa";
import type { Currency } from "@/lib/types";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

async function getRecipientWishlist(groupId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/wishlists/recipient/${groupId}`,
    {
      headers: {
        Cookie: (await headers()).get("cookie") || "",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function RecipientWishlistPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/");
  }

  const { groupId } = await params;
  const data = await getRecipientWishlist(groupId);

  if (!data) {
    notFound();
  }

  const { recipient, group: groupData, items } = data;
  const currency = groupData.currency as Currency;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/groups/${groupId}/draw`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Draw
          </Link>
        </Button>
      </div>

      {/* Recipient Info */}
      <Card className="mb-6 border-christmas-green/30 bg-gradient-to-br from-christmas-green/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-christmas-green mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium uppercase tracking-wider">
              You are the Secret Santa for
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-christmas-gold">
              <AvatarImage
                src={recipient.image || ""}
                alt={recipient.name}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback className="text-lg bg-christmas-red text-white">
                {getInitials(recipient.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{recipient.name}</h2>
              <p className="text-muted-foreground">{recipient.email}</p>
            </div>
          </div>

          {/* Interests */}
          {recipient.interests && recipient.interests.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Interests:</p>
              <div className="flex flex-wrap gap-2">
                {recipient.interests.map((interest: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {recipient.bio && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-1">About:</p>
              <p className="text-sm">{recipient.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-medium">{groupData.name}</span>
            {(groupData.budgetMin || groupData.budgetMax) && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Budget:{" "}
                  <span className="font-medium">
                    {groupData.budgetMin && groupData.budgetMax
                      ? `${formatPrice(groupData.budgetMin, currency)} - ${formatPrice(groupData.budgetMax, currency)}`
                      : groupData.budgetMin
                        ? `Min ${formatPrice(groupData.budgetMin, currency)}`
                        : `Max ${formatPrice(groupData.budgetMax!, currency)}`}
                  </span>
                </span>
              </div>
            )}
            {groupData.exchangeDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {formatExchangeDate(new Date(groupData.exchangeDate))}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-christmas-red" />
            {recipient.name}&apos;s Wishlist
          </CardTitle>
          <CardDescription>
            These are the items {recipient.name} has added to their wishlist.
            Mark items as purchased to let other Secret Santas know (the recipient won&apos;t see this).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WishlistList
            items={items}
            currency={currency}
            isOwner={false}
            showPurchaseButton={true}
            emptyMessage={`${recipient.name} hasn't added any items to their wishlist yet. Check back later or use AI suggestions for gift ideas!`}
          />
        </CardContent>
      </Card>

      {/* AI Suggestions Button */}
      <div className="mt-6 text-center">
        <p className="text-muted-foreground text-sm mb-3">
          Need more gift ideas? Get AI-powered suggestions based on their interests!
        </p>
        <Button asChild variant="outline">
          <Link href={`/groups/${groupId}/suggestions`}>
            <Sparkles className="h-4 w-4 mr-2" />
            Get AI Suggestions
          </Link>
        </Button>
      </div>
    </div>
  );
}

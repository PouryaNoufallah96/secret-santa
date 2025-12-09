"use client";

import { Gift } from "lucide-react";
import { WishlistItemCard } from "./wishlist-item-card";
import type { Currency } from "@/lib/types";

type Priority = "low" | "medium" | "high";

interface WishlistItem {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
  price: number | null;
  priority: Priority;
  groupId: string | null;
  isPurchased?: boolean;
  purchasedByMe?: boolean;
}

interface WishlistListProps {
  items: WishlistItem[];
  currency?: Currency;
  isOwner?: boolean;
  showPurchaseButton?: boolean;
  emptyMessage?: string;
  onItemDelete?: () => void;
}

export function WishlistList({
  items,
  currency = "USD",
  isOwner = false,
  showPurchaseButton = false,
  emptyMessage = "No items in wishlist yet.",
  onItemDelete,
}: WishlistListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Gift className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Sort items by priority (high first) then by creation date
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedItems = [...items].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-3">
      {sortedItems.map((item) => (
        <WishlistItemCard
          key={item.id}
          item={item}
          currency={currency}
          isOwner={isOwner}
          showPurchaseButton={showPurchaseButton}
          onDelete={onItemDelete}
        />
      ))}
    </div>
  );
}

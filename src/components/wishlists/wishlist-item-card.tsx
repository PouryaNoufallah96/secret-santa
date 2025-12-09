"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Trash2, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PriorityBadge } from "./priority-badge";
import { PurchaseButton } from "./purchase-button";
import { WishlistForm } from "./wishlist-form";
import { formatPrice } from "@/lib/secret-santa";
import { cn } from "@/lib/utils";
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

export interface WishlistItemCardProps {
  item: WishlistItem;
  currency?: Currency;
  isOwner?: boolean;
  showPurchaseButton?: boolean;
  onDelete?: (() => void) | undefined;
  className?: string;
}

export function WishlistItemCard({
  item,
  currency = "USD",
  isOwner = false,
  showPurchaseButton = false,
  onDelete,
  className,
}: WishlistItemCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/wishlists/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete item");
      }

      toast.success("Item deleted", {
        description: `"${item.name}" has been removed from your wishlist.`,
      });

      onDelete?.();
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const isPurchased = item.isPurchased || false;
  const purchasedByMe = item.purchasedByMe || false;

  return (
    <>
      <Card
        className={cn(
          "transition-all hover:shadow-md",
          isPurchased && !purchasedByMe && "opacity-60",
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Image */}
            {item.imageUrl && (
              <div className="flex-shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-base truncate">
                      {item.name}
                    </h3>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {isOwner && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <WishlistForm
                        editItem={{
                          id: item.id,
                          name: item.name,
                          description: item.description,
                          url: item.url,
                          imageUrl: item.imageUrl,
                          price: item.price,
                          priority: item.priority,
                        }}
                        currency={currency}
                      />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Price and Link */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {item.price && (
                    <span className="font-medium text-christmas-green">
                      {formatPrice(item.price, currency)}
                    </span>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Product
                    </a>
                  )}
                </div>

                {/* Purchase Button for Santa */}
                {showPurchaseButton && !isOwner && (
                  <PurchaseButton
                    itemId={item.id}
                    itemName={item.name}
                    isPurchased={isPurchased}
                    purchasedByMe={purchasedByMe}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{item.name}&quot; from your wishlist. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

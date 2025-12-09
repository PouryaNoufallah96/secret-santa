"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PurchaseButtonProps {
  itemId: string;
  itemName: string;
  isPurchased: boolean;
  purchasedByMe: boolean;
  className?: string;
  onPurchaseChange?: () => void;
}

export function PurchaseButton({
  itemId,
  itemName,
  isPurchased,
  purchasedByMe,
  className,
  onPurchaseChange,
}: PurchaseButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wishlists/${itemId}/purchase`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update purchase status");
      }

      if (data.item.purchasedByMe) {
        toast.success("Marked as purchased!", {
          description: `"${itemName}" has been marked as purchased.`,
        });
      } else {
        toast.success("Purchase removed", {
          description: `"${itemName}" is no longer marked as purchased.`,
        });
      }

      onPurchaseChange?.();
      router.refresh();
    } catch (error) {
      toast.error("Failed to update", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Already purchased by someone else
  if (isPurchased && !purchasedByMe) {
    return (
      <Button
        variant="secondary"
        size="sm"
        disabled
        className={cn("cursor-not-allowed", className)}
      >
        <Check className="h-4 w-4 mr-2" />
        Already Purchased
      </Button>
    );
  }

  // Purchased by me - show unpurchase option
  if (purchasedByMe) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("text-christmas-green border-christmas-green/30", className)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Purchased
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove purchase mark?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the purchased status from &quot;{itemName}&quot;.
              Other Secret Santas may then mark it as purchased.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePurchase}>
              Remove Mark
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Not purchased - show purchase option
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePurchase}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <ShoppingCart className="h-4 w-4 mr-2" />
      )}
      Mark as Purchased
    </Button>
  );
}

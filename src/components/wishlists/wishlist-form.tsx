"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Gift, Link as LinkIcon, DollarSign, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PrioritySelector } from "./priority-badge";
import { parsePriceToCents } from "@/lib/secret-santa";
import type { Currency } from "@/lib/types";

type Priority = "low" | "medium" | "high";

interface WishlistFormProps {
  groupId?: string;
  currency?: Currency;
  onItemAdded?: () => void;
  editItem?: {
    id: string;
    name: string;
    description: string | null;
    url: string | null;
    imageUrl: string | null;
    price: number | null;
    priority: Priority;
  };
}

export function WishlistForm({
  groupId,
  currency = "USD",
  onItemAdded,
  editItem,
}: WishlistFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(editItem?.name || "");
  const [description, setDescription] = useState(editItem?.description || "");
  const [url, setUrl] = useState(editItem?.url || "");
  const [imageUrl, setImageUrl] = useState(editItem?.imageUrl || "");
  const [priceValue, setPriceValue] = useState(
    editItem?.price ? (editItem.price / 100).toFixed(2) : ""
  );
  const [priority, setPriority] = useState<Priority>(editItem?.priority || "medium");

  const isEditing = !!editItem;

  const resetForm = () => {
    if (!editItem) {
      setName("");
      setDescription("");
      setUrl("");
      setImageUrl("");
      setPriceValue("");
      setPriority("medium");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a name for the item");
      return;
    }

    setIsSubmitting(true);

    try {
      const priceInCents = priceValue ? parsePriceToCents(priceValue) : null;

      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        url: url.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        price: priceInCents || undefined,
        priority,
        groupId: groupId || undefined,
      };

      const endpoint = isEditing
        ? `/api/wishlists/${editItem.id}`
        : "/api/wishlists";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to save item"
        );
      }

      toast.success(isEditing ? "Item updated!" : "Item added to wishlist!", {
        description: `"${name}" has been ${isEditing ? "updated" : "added"}.`,
      });

      setIsOpen(false);
      resetForm();
      onItemAdded?.();
      router.refresh();
    } catch (error) {
      toast.error("Failed to save item", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        ) : (
          <Button className="bg-christmas-red hover:bg-christmas-red/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-christmas-red" />
            {isEditing ? "Edit Wishlist Item" : "Add Wishlist Item"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this gift idea."
              : "Add a gift idea to your wishlist. Your Secret Santa will see this!"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Cozy Sweater, Board Game, Book..."
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details like color, size, or specific preferences..."
              maxLength={1000}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                Product URL
              </Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Price ({currency})
              </Label>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              Image URL
            </Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <PrioritySelector value={priority} onChange={setPriority} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-christmas-red hover:bg-christmas-red/90"
            >
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                  ? "Save Changes"
                  : "Add to Wishlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

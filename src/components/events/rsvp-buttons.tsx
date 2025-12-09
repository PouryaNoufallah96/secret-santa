"use client";

import { useState } from "react";
import { Check, X, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RSVPStatus = "attending" | "not_attending" | "maybe";

interface RSVPButtonsProps {
  groupId: string;
  currentStatus: RSVPStatus | null;
  currentNote: string | null;
  onUpdate: (status: RSVPStatus, note: string | null) => void;
}

export function RSVPButtons({
  groupId,
  currentStatus,
  currentNote,
  onUpdate,
}: RSVPButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(currentNote || "");
  const [showNote, setShowNote] = useState(!!currentNote);

  async function handleRSVP(status: RSVPStatus) {
    setLoading(true);

    try {
      const res = await fetch(`/api/groups/${groupId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: note || null }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update RSVP");
      }

      const data = await res.json();
      onUpdate(data.rsvp.status, data.rsvp.note);

      const statusMessages = {
        attending: "See you there!",
        not_attending: "We'll miss you!",
        maybe: "Let us know when you decide!",
      };
      toast.success(statusMessages[status]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update RSVP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your RSVP</CardTitle>
        <CardDescription>
          Let everyone know if you&apos;ll be at the gift exchange
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={currentStatus === "attending" ? "default" : "outline"}
            className={cn(
              currentStatus === "attending" &&
                "bg-christmas-green hover:bg-christmas-green/90"
            )}
            onClick={() => handleRSVP("attending")}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Attending
          </Button>
          <Button
            variant={currentStatus === "maybe" ? "default" : "outline"}
            className={cn(
              currentStatus === "maybe" &&
                "bg-christmas-gold hover:bg-christmas-gold/90 text-black"
            )}
            onClick={() => handleRSVP("maybe")}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <HelpCircle className="mr-2 h-4 w-4" />
            )}
            Maybe
          </Button>
          <Button
            variant={currentStatus === "not_attending" ? "default" : "outline"}
            className={cn(
              currentStatus === "not_attending" &&
                "bg-destructive hover:bg-destructive/90"
            )}
            onClick={() => handleRSVP("not_attending")}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-2 h-4 w-4" />
            )}
            Can&apos;t Make It
          </Button>
        </div>

        {!showNote && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={() => setShowNote(true)}
          >
            Add a note (optional)
          </Button>
        )}

        {showNote && (
          <div className="space-y-2">
            <Label htmlFor="rsvp-note">Note (optional)</Label>
            <Input
              id="rsvp-note"
              placeholder="e.g., I'll bring dessert!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Your note will be visible to other group members
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

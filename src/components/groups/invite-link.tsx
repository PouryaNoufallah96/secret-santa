"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Copy, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InviteLinkProps {
  groupId: string;
  isAdmin: boolean;
}

export function InviteLink({ groupId, isAdmin }: InviteLinkProps) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState<"code" | "url" | null>(null);

  const fetchInviteCode = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/invite`);
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.inviteCode);
        setInviteUrl(data.inviteUrl);
      }
    } catch (error) {
      console.error("Error fetching invite code:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchInviteCode();
  }, [fetchInviteCode]);

  async function regenerateCode() {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/invite`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setInviteCode(data.inviteCode);
        setInviteUrl(data.inviteUrl);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to regenerate code");
      }
    } catch (error) {
      console.error("Error regenerating code:", error);
      alert("Failed to regenerate code");
    } finally {
      setRegenerating(false);
    }
  }

  async function copyToClipboard(text: string, type: "code" | "url") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }

  async function shareInvite() {
    if (!inviteUrl || !navigator.share) return;

    try {
      await navigator.share({
        title: "Join my Secret Santa group!",
        text: `Join our Secret Santa gift exchange! Use code: ${inviteCode}`,
        url: inviteUrl,
      });
    } catch (error) {
      // User cancelled or share failed - fall back to copy
      if ((error as Error).name !== "AbortError") {
        copyToClipboard(inviteUrl, "url");
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christmas-red" />
      </div>
    );
  }

  if (!inviteCode) {
    return (
      <p className="text-muted-foreground text-sm">
        Unable to load invite code
      </p>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Invite Code */}
        <div className="space-y-2">
          <Label>Invite Code</Label>
          <div className="flex gap-2">
            <Input
              value={inviteCode}
              readOnly
              className="font-mono text-center text-lg tracking-widest"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(inviteCode, "code")}
                >
                  {copied === "code" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy code</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Invite URL */}
        <div className="space-y-2">
          <Label>Invite Link</Label>
          <div className="flex gap-2">
            <Input
              value={inviteUrl || ""}
              readOnly
              className="text-sm"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => inviteUrl && copyToClipboard(inviteUrl, "url")}
                >
                  {copied === "url" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy link</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {typeof navigator !== "undefined" && "share" in navigator && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={shareInvite}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={regenerateCode}
                  disabled={regenerating}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Generate new code (invalidates old one)
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Share this code with friends so they can join your Secret Santa group
        </p>
      </div>
    </TooltipProvider>
  );
}

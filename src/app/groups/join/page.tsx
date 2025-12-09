"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Gift, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { UserProfile } from "@/components/auth/user-profile";
import { isValidInviteCode } from "@/lib/secret-santa";

function JoinGroupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [groupPreview, setGroupPreview] = useState<{
    id: string;
    name: string;
    memberCount: number;
  } | null>(null);

  // Pre-fill from URL query param
  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    if (codeFromUrl) {
      setInviteCode(codeFromUrl.toUpperCase());
    }
  }, [searchParams]);

  // Look up group when code changes
  useEffect(() => {
    if (!session || !isValidInviteCode(inviteCode)) {
      setGroupPreview(null);
      return;
    }

    const lookupGroup = async () => {
      setLookupLoading(true);
      try {
        const res = await fetch(`/api/groups/lookup?code=${inviteCode}`);
        if (res.ok) {
          const data = await res.json();
          setGroupPreview(data.group);
        } else {
          setGroupPreview(null);
        }
      } catch {
        setGroupPreview(null);
      } finally {
        setLookupLoading(false);
      }
    };

    const debounce = setTimeout(lookupGroup, 300);
    return () => clearTimeout(debounce);
  }, [inviteCode, session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isValidInviteCode(inviteCode)) {
      setError("Please enter a valid 8-character invite code");
      setLoading(false);
      return;
    }

    try {
      // First, find the group by invite code
      const lookupRes = await fetch(`/api/groups/lookup?code=${inviteCode}`);
      if (!lookupRes.ok) {
        const errorData = await lookupRes.json();
        throw new Error(errorData.error || "Invalid invite code");
      }
      const { group } = await lookupRes.json();

      // Then join the group
      const joinRes = await fetch(`/api/groups/${group.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });

      if (!joinRes.ok) {
        const errorData = await joinRes.json();
        throw new Error(errorData.error || "Failed to join group");
      }

      router.push(`/groups/${group.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christmas-red" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">
              You need to sign in to join a Secret Santa group
            </p>
          </div>
          <UserProfile />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/groups">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-christmas-red/10 flex items-center justify-center">
            <Gift className="h-6 w-6 text-christmas-red" />
          </div>
          <CardTitle className="font-nunito text-2xl">Join a Group</CardTitle>
          <CardDescription>
            Enter the invite code shared with you to join a Secret Santa group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                placeholder="SANTA24X"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="text-center text-2xl tracking-widest font-mono uppercase"
              />
              <p className="text-xs text-muted-foreground">
                8-character code (letters and numbers)
              </p>
            </div>

            {/* Group Preview */}
            {lookupLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-christmas-red" />
              </div>
            )}
            {groupPreview && !lookupLoading && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="font-semibold">{groupPreview.name}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{groupPreview.memberCount} members</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-christmas-red hover:bg-christmas-red/90"
              disabled={loading || !isValidInviteCode(inviteCode)}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                "Join Group"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JoinGroupPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christmas-red" />
      </div>
    }>
      <JoinGroupForm />
    </Suspense>
  );
}

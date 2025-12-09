"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupCard } from "@/components/groups/group-card";
import { useSession } from "@/lib/auth-client";
import { UserProfile } from "@/components/auth/user-profile";
import type { Group } from "@/lib/types";

interface GroupWithRole extends Group {
  role: "admin" | "member";
  joinedAt: string;
  memberCount: number;
}

export default function GroupsPage() {
  const { data: session, isPending } = useSession();
  const [groups, setGroups] = useState<GroupWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    async function fetchGroups() {
      try {
        const res = await fetch("/api/groups");
        if (!res.ok) throw new Error("Failed to fetch groups");
        const data = await res.json();
        setGroups(data.groups);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, [session]);

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
              You need to sign in to view your Secret Santa groups
            </p>
          </div>
          <UserProfile />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-nunito text-christmas-red dark:text-christmas-gold">
            My Groups
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your Secret Santa gift exchanges
          </p>
        </div>
        <Button asChild className="bg-christmas-red hover:bg-christmas-red/90">
          <Link href="/groups/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christmas-red" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No groups yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first Secret Santa group or join one with an invite code
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild className="bg-christmas-red hover:bg-christmas-red/90">
              <Link href="/groups/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/groups/join">Join with Code</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} role={group.role} />
          ))}
        </div>
      )}
    </div>
  );
}

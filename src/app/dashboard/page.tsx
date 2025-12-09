"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Plus, Users, Gift, Calendar, ArrowRight } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth-client";
import { formatShortDate, daysUntil, getTimeBasedGreeting } from "@/lib/secret-santa";
import type { Group } from "@/lib/types";

interface GroupWithRole extends Group {
  role: "admin" | "member";
  joinedAt: string;
  memberCount: number;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [groups, setGroups] = useState<GroupWithRole[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    if (!session) return;

    async function fetchGroups() {
      try {
        const res = await fetch("/api/groups");
        if (res.ok) {
          const data = await res.json();
          setGroups(data.groups);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      } finally {
        setLoadingGroups(false);
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
            <h1 className="text-2xl font-bold mb-2">Protected Page</h1>
            <p className="text-muted-foreground mb-6">
              You need to sign in to access the dashboard
            </p>
          </div>
          <UserProfile />
        </div>
      </div>
    );
  }

  const upcomingExchanges = groups
    .filter((g) => g.exchangeDate && !g.isArchived)
    .sort(
      (a, b) =>
        new Date(a.exchangeDate!).getTime() - new Date(b.exchangeDate!).getTime()
    )
    .slice(0, 3);

  const pendingDraws = groups.filter((g) => !g.drawCompleted && !g.isArchived);

  return (
    <div className="container mx-auto p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-nunito text-christmas-red dark:text-christmas-gold">
          {getTimeBasedGreeting()}, {session.user.name?.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your Secret Santa dashboard
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <Link
              href="/groups/new"
              className="flex items-center gap-4 text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-christmas-red/10">
                <Plus className="h-6 w-6 text-christmas-red" />
              </div>
              <div>
                <h3 className="font-semibold">Create Group</h3>
                <p className="text-sm text-muted-foreground">
                  Start a new gift exchange
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <Link
              href="/groups/join"
              className="flex items-center gap-4 text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-christmas-green/10">
                <Users className="h-6 w-6 text-christmas-green" />
              </div>
              <div>
                <h3 className="font-semibold">Join Group</h3>
                <p className="text-sm text-muted-foreground">
                  Use an invite code
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <Link
              href="/groups"
              className="flex items-center gap-4 text-left"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-christmas-gold/10">
                <Gift className="h-6 w-6 text-christmas-gold" />
              </div>
              <div>
                <h3 className="font-semibold">My Groups</h3>
                <p className="text-sm text-muted-foreground">
                  {groups.length} group{groups.length !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exchanges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-christmas-red" />
              Upcoming Exchanges
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/groups">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loadingGroups ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christmas-red" />
              </div>
            ) : upcomingExchanges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming exchanges</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingExchanges.map((group) => {
                  const days = daysUntil(new Date(group.exchangeDate!));
                  return (
                    <Link
                      key={group.id}
                      href={`/groups/${group.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatShortDate(new Date(group.exchangeDate!))}
                        </p>
                      </div>
                      <Badge
                        variant={
                          days <= 3
                            ? "destructive"
                            : days <= 7
                              ? "default"
                              : "secondary"
                        }
                      >
                        {days === 0
                          ? "Today!"
                          : days === 1
                            ? "Tomorrow"
                            : `${days} days`}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Draws */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-christmas-green" />
              Pending Draws
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingGroups ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-christmas-red" />
              </div>
            ) : pendingDraws.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>All draws completed!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDraws.slice(0, 3).map((group) => (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {group.role === "admin" && (
                      <Badge
                        variant="outline"
                        className="border-christmas-gold text-christmas-gold"
                      >
                        Draw names
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

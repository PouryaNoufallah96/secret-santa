"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Gift,
  Lock,
  Settings,
  Users,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MemberList } from "@/components/groups/member-list";
import { InviteLink } from "@/components/groups/invite-link";
import { useSession } from "@/lib/auth-client";
import { UserProfile } from "@/components/auth/user-profile";
import { formatPrice, formatExchangeDate, daysUntil } from "@/lib/secret-santa";
import type { Group, Currency } from "@/lib/types";

interface Member {
  id: string;
  userId: string;
  role: "admin" | "member";
  joinedAt: string;
  hasViewedAssignment: boolean;
  userName: string;
  userEmail: string;
  userImage: string | null;
}

interface GroupDetails {
  group: Group & { memberCount: number };
  members: Member[];
  currentUserRole: "admin" | "member";
}

export default function GroupDashboardPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    async function fetchGroup() {
      try {
        const res = await fetch(`/api/groups/${groupId}`);
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("You are not a member of this group");
          }
          if (res.status === 404) {
            throw new Error("Group not found");
          }
          throw new Error("Failed to fetch group");
        }
        const data = await res.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchGroup();
  }, [session, groupId]);

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
              You need to sign in to view this group
            </p>
          </div>
          <UserProfile />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-christmas-red" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button asChild>
            <Link href="/groups">Back to Groups</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { group, members, currentUserRole } = data;
  const isAdmin = currentUserRole === "admin";
  const daysLeft = group.exchangeDate ? daysUntil(new Date(group.exchangeDate)) : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/groups">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-nunito text-christmas-red dark:text-christmas-gold">
              {group.name}
            </h1>
            {group.drawCompleted && (
              <Badge className="bg-christmas-green text-white">
                Draw Complete
              </Badge>
            )}
          </div>
          {group.description && (
            <p className="text-muted-foreground mt-2">{group.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {isAdmin && !group.drawCompleted && (
            <Button
              className="bg-christmas-green hover:bg-christmas-green/90"
              asChild
            >
              <Link href={`/groups/${groupId}/draw`}>
                <Shuffle className="mr-2 h-4 w-4" />
                Draw Names
              </Link>
            </Button>
          )}
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link href={`/groups/${groupId}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">{members.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Members</p>
              </CardContent>
            </Card>

            {(group.budgetMin || group.budgetMax) && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-bold">
                      {group.budgetMin && group.budgetMax
                        ? `${formatPrice(group.budgetMin, group.currency as Currency)} - ${formatPrice(group.budgetMax, group.currency as Currency)}`
                        : group.budgetMin
                          ? `Min ${formatPrice(group.budgetMin, group.currency as Currency)}`
                          : `Max ${formatPrice(group.budgetMax!, group.currency as Currency)}`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                </CardContent>
              </Card>
            )}

            {group.exchangeDate && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-bold">
                      {daysLeft !== null && daysLeft >= 0
                        ? `${daysLeft} days`
                        : "Past"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Until exchange</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-bold">
                    {group.drawCompleted ? "Ready" : "Pending"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Draw Status</p>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Section (only show if draw is complete) */}
          {group.drawCompleted && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-christmas-red" />
                  Your Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Click below to reveal who you&apos;re buying a gift for!
                </p>
                <Button
                  className="bg-christmas-red hover:bg-christmas-red/90"
                  asChild
                >
                  <Link href={`/groups/${groupId}/assignment`}>
                    View My Assignment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Members List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MemberList
                members={members}
                currentUserId={session.user.id}
                currentUserRole={currentUserRole}
                groupId={groupId}
                drawCompleted={group.drawCompleted}
                onMemberUpdate={() => {
                  // Refresh the page data
                  window.location.reload();
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invite Section */}
          {!group.drawCompleted && (
            <Card>
              <CardHeader>
                <CardTitle>Invite Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <InviteLink groupId={groupId} isAdmin={isAdmin} />
              </CardContent>
            </Card>
          )}

          {/* Group Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.exchangeDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Exchange Date
                  </p>
                  <p>{formatExchangeDate(new Date(group.exchangeDate))}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Currency
                </p>
                <p>{group.currency}</p>
              </div>

              {(group.budgetMin || group.budgetMax) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Budget Range
                  </p>
                  <p>
                    {group.budgetMin &&
                      formatPrice(group.budgetMin, group.currency as Currency)}{" "}
                    {group.budgetMin && group.budgetMax && "-"}{" "}
                    {group.budgetMax &&
                      formatPrice(group.budgetMax, group.currency as Currency)}
                  </p>
                </div>
              )}

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Your Role
                </p>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? "Admin" : "Member"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/groups/${groupId}/wishlist`}>
                  <Gift className="mr-2 h-4 w-4" />
                  View Wishlists
                </Link>
              </Button>
              {group.drawCompleted && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/groups/${groupId}/messages`}>
                    <Users className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
  Sparkles,
} from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { InviteLink } from "@/components/groups/invite-link";
import { MemberList } from "@/components/groups/member-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SnowflakeSpinner } from "@/components/ui/snowflake-spinner";
import { useSession } from "@/lib/auth-client";
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
      <div className="flex justify-center items-center h-screen bg-background">
        <SnowflakeSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full p-8 text-center border-none shadow-xl bg-card/80 backdrop-blur">
          <Lock className="w-16 h-16 mx-auto mb-4 text-christmas-red" />
          <h1 className="text-2xl font-bold mb-2 font-nunito">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to sign in to view this group
          </p>
          <UserProfile />
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <SnowflakeSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-md mx-auto p-8 border-destructive/20 bg-destructive/5">
          <p className="text-destructive mb-4 font-medium">{error}</p>
          <Button asChild variant="outline">
            <Link href="/groups">Back to Groups</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { group, members, currentUserRole } = data;
  const isAdmin = currentUserRole === "admin";
  const daysLeft = group.exchangeDate ? daysUntil(new Date(group.exchangeDate)) : null;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-christmas-red to-berry-red text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto relative z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="text-white/80 hover:text-white hover:bg-white/10 mb-6"
          >
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold font-nunito text-white drop-shadow-sm">
                  {group.name}
                </h1>
                {group.drawCompleted && (
                  <Badge className="bg-christmas-green text-white border-none shadow-sm text-base px-3 py-1">
                    <Gift className="mr-2 h-4 w-4" />
                    Draw Complete
                  </Badge>
                )}
              </div>
              {group.description && (
                <p className="text-white/90 text-lg max-w-2xl font-light">
                  {group.description}
                </p>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              {isAdmin && !group.drawCompleted && (
                <Button
                  className="bg-christmas-gold hover:bg-christmas-gold/90 text-white font-bold shadow-lg border-none"
                  size="lg"
                  asChild
                >
                  <Link href={`/groups/${groupId}/draw`}>
                    <Shuffle className="mr-2 h-5 w-5" />
                    Draw Names
                  </Link>
                </Button>
              )}
              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white hover:border-white/40 backdrop-blur-sm"
                  asChild
                >
                  <Link href={`/groups/${groupId}/settings`}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card shadow-md hover:shadow-lg transition-shadow border-none">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-christmas-green/10 flex items-center justify-center mb-3">
                    <Users className="h-5 w-5 text-christmas-green" />
                  </div>
                  <span className="text-2xl font-bold font-nunito">{members.length}</span>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Members</p>
                </CardContent>
              </Card>

              {(group.budgetMin || group.budgetMax) && (
                <Card className="bg-card shadow-md hover:shadow-lg transition-shadow border-none">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-christmas-gold/10 flex items-center justify-center mb-3">
                      <DollarSign className="h-5 w-5 text-christmas-gold" />
                    </div>
                    <span className="text-lg font-bold font-nunito line-clamp-1">
                      {group.budgetMin && group.budgetMax
                        ? `${formatPrice(group.budgetMin, group.currency as Currency)} - ${formatPrice(group.budgetMax, group.currency as Currency)}`
                        : group.budgetMin
                          ? `Min ${formatPrice(group.budgetMin, group.currency as Currency)}`
                          : `Max ${formatPrice(group.budgetMax!, group.currency as Currency)}`}
                    </span>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Budget</p>
                  </CardContent>
                </Card>
              )}

              {group.exchangeDate && (
                <Card className="bg-card shadow-md hover:shadow-lg transition-shadow border-none">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-full bg-christmas-red/10 flex items-center justify-center mb-3">
                      <Calendar className="h-5 w-5 text-christmas-red" />
                    </div>
                    <span className="text-xl font-bold font-nunito">
                      {daysLeft !== null && daysLeft >= 0
                        ? daysLeft === 0 ? "Today!" : `${daysLeft} days`
                        : "Past"}
                    </span>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Countdown</p>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-card shadow-md hover:shadow-lg transition-shadow border-none">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                    <Gift className="h-5 w-5 text-blue-500" />
                  </div>
                  <span className="text-lg font-bold font-nunito">
                    {group.drawCompleted ? "Ready" : "Pending"}
                  </span>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Status</p>
                </CardContent>
              </Card>
            </div>

            {/* Assignment Section */}
            {group.drawCompleted && (
              <Card className="border-christmas-gold/50 shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-christmas-gold/10 rounded-full blur-2xl -mr-16 -mt-16" />
                <CardHeader className="bg-christmas-gold/5 border-b border-christmas-gold/10">
                  <CardTitle className="flex items-center gap-2 text-christmas-gold">
                    <Sparkles className="h-5 w-5" />
                    Your Secret Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold font-nunito mb-4">Who are you buying for?</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    The draw has been completed! Click below to reveal your assignment and see their wishlist.
                  </p>
                  <Button
                    size="lg"
                    className="bg-christmas-red hover:bg-christmas-red/90 text-white rounded-full px-8 shadow-md"
                    asChild
                  >
                    <Link href={`/groups/${groupId}/draw`}>
                      Reveal My Match
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Members List */}
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-nunito text-xl">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  Members
                  <Badge variant="secondary" className="ml-2 rounded-full">
                    {members.length}
                  </Badge>
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
                    window.location.reload();
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:pt-8">
            {/* Action Cards */}
            <Card className="bg-gradient-to-br from-card to-muted shadow-sm border-border/50">
               <CardHeader>
                <CardTitle className="font-nunito">Your Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start bg-white hover:bg-gray-50 text-foreground border shadow-sm group" 
                  variant="outline"
                  asChild
                >
                  <Link href={`/wishlists/${groupId}`}>
                    <div className="p-2 rounded-full bg-christmas-red/10 mr-3 group-hover:bg-christmas-red/20 transition-colors">
                       <Gift className="h-4 w-4 text-christmas-red" />
                    </div>
                    <span>My Wishlist</span>
                  </Link>
                </Button>
                {group.drawCompleted && (
                  <Button 
                    className="w-full justify-start bg-white hover:bg-gray-50 text-foreground border shadow-sm group" 
                    variant="outline"
                    asChild
                  >
                    <Link href={`/groups/${groupId}/messages`}>
                      <div className="p-2 rounded-full bg-christmas-green/10 mr-3 group-hover:bg-christmas-green/20 transition-colors">
                        <Users className="h-4 w-4 text-christmas-green" />
                      </div>
                      <span>Group Chat</span>
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Invite Section */}
            {!group.drawCompleted && (
              <Card className="shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle className="font-nunito">Invite Friends</CardTitle>
                </CardHeader>
                <CardContent>
                  <InviteLink groupId={groupId} isAdmin={isAdmin} />
                </CardContent>
              </Card>
            )}

            {/* Group Details */}
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="font-nunito">Group Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.exchangeDate && (
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="font-medium">{formatExchangeDate(new Date(group.exchangeDate))}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-border/50">
                   <span className="text-sm text-muted-foreground">Currency</span>
                   <span className="font-medium">{group.currency}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/50">
                   <span className="text-sm text-muted-foreground">Your Role</span>
                   <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? "Admin" : "Member"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

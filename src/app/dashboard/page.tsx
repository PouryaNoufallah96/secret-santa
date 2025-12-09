"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Plus, Users, Gift, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SnowflakeSpinner } from "@/components/ui/snowflake-spinner";
import { useSession } from "@/lib/auth-client";
import { formatShortDate, daysUntil, getTimeBasedGreeting } from "@/lib/secret-santa";
import type { Group } from "@/lib/types";
import { GroupCard } from "@/components/groups/group-card";
import { Snowfall } from "@/components/ui/snowfall";

interface GroupWithRole extends Group {
  role: "admin" | "member";
  joinedAt: string;
  memberCount: number;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [groups, setGroups] = useState<GroupWithRole[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");

  // Ensure consistent rendering between server and client
  useEffect(() => {
    setMounted(true);
    setGreeting(getTimeBasedGreeting());
  }, []);

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

  // Show loading spinner until mounted and session is ready
  if (!mounted || isPending) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <SnowflakeSpinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full p-8 border-none shadow-lg bg-card/50 backdrop-blur">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-christmas-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-christmas-red" />
            </div>
            <h1 className="text-2xl font-bold font-nunito mb-2">Sign in Required</h1>
            <p className="text-muted-foreground mb-6">
              Please sign in to access your festive dashboard and manage your gift exchanges.
            </p>
            <UserProfile />
          </div>
        </Card>
      </div>
    );
  }

  const activeGroups = groups.filter((g) => !g.isArchived);
  const upcomingExchanges = activeGroups
    .filter((g) => g.exchangeDate)
    .sort(
      (a, b) =>
        new Date(a.exchangeDate!).getTime() - new Date(b.exchangeDate!).getTime()
    );

  const nextExchange = upcomingExchanges[0];
  const daysToNextExchange = nextExchange?.exchangeDate
    ? daysUntil(new Date(nextExchange.exchangeDate))
    : null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-christmas-red/5 to-transparent -z-10" />
      <Snowfall className="opacity-50" count={50} />

      <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-nunito text-foreground mb-2">
              {greeting}, <span className="text-christmas-red">{session.user.name?.split(" ")[0]}</span>!
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome to your Sleigh dashboard
            </p>
          </div>
          
          <div className="flex gap-3">
             <Button
              asChild
              size="lg"
              className="bg-christmas-red hover:bg-christmas-red/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/groups/new">
                <Plus className="mr-2 h-5 w-5" />
                New Exchange
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-christmas-green text-christmas-green hover:bg-christmas-green/10 rounded-full"
            >
              <Link href="/groups/join">
                <Users className="mr-2 h-5 w-5" />
                Join Group
              </Link>
            </Button>
          </div>
        </div>

        {/* Next Event Highlight */}
        {nextExchange && daysToNextExchange !== null && (
          <div className="mb-12">
            <Card className="border-none shadow-xl bg-gradient-to-r from-christmas-red to-berry-red text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
              
              <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <div className="flex items-center gap-2 text-white/80 mb-2 font-medium uppercase tracking-wide text-sm">
                    <Calendar className="w-4 h-4" />
                    Upcoming Exchange
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold font-nunito mb-2">
                    {nextExchange.name}
                  </h2>
                  <p className="text-white/90 text-lg max-w-xl">
                    {daysToNextExchange === 0 
                      ? "The exchange is today! Have fun!" 
                      : `Only ${daysToNextExchange} days left until the gift exchange! Make sure your wishlist is ready.`}
                  </p>
                </div>
                
                <div className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl p-4 min-w-[120px]">
                  <span className="text-5xl font-bold font-nunito">
                    {daysToNextExchange}
                  </span>
                  <span className="text-sm font-medium uppercase tracking-wider">
                    Days Left
                  </span>
                </div>

                <Button 
                  asChild 
                  variant="secondary" 
                  size="lg"
                  className="bg-white text-christmas-red hover:bg-white/90 rounded-full px-8 font-bold shadow-lg"
                >
                  <Link href={`/groups/${nextExchange.id}`}>
                    Go to Group
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Groups Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-nunito flex items-center gap-2">
              <Gift className="w-6 h-6 text-christmas-green" />
              Your Groups
            </h2>
            {activeGroups.length > 0 && (
               <Link href="/groups" className="text-primary hover:underline flex items-center gap-1 font-medium">
                 View all
                 <ArrowRight className="w-4 h-4" />
               </Link>
            )}
          </div>

          {loadingGroups ? (
            <div className="flex justify-center py-12">
              <SnowflakeSpinner size="lg" />
            </div>
          ) : activeGroups.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border shadow-sm">
              <div className="w-20 h-20 bg-christmas-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-10 h-10 text-christmas-green" />
              </div>
              <h3 className="text-xl font-bold font-nunito mb-2">No Groups Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                You haven't joined any Secret Santa groups yet. Create a new one or join an existing one to get started!
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild className="bg-christmas-red hover:bg-christmas-red/90 text-white rounded-full">
                  <Link href="/groups/new">Create Group</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/groups/join">Join Group</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGroups.slice(0, 6).map((group) => (
                <GroupCard key={group.id} group={group} role={group.role} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

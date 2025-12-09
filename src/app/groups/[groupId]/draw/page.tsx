import { headers } from "next/headers";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, Gift, Calendar, Sparkles } from "lucide-react";
import { AssignmentReveal } from "@/components/draw/assignment-reveal";
import { CountdownTimer } from "@/components/draw/countdown-timer";
import { DrawControls } from "@/components/draw/draw-controls";
import { ExclusionManager } from "@/components/groups/exclusion-manager";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { exclusionRule, group, groupMember, user } from "@/lib/schema";
import type { Currency } from "@/lib/types";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

async function getGroupData(groupId: string, userId: string) {
  // Get group
  const [groupData] = await db
    .select()
    .from(group)
    .where(eq(group.id, groupId))
    .limit(1);

  if (!groupData) {
    return null;
  }

  // Get user's membership
  const [membership] = await db
    .select()
    .from(groupMember)
    .where(
      and(eq(groupMember.groupId, groupId), eq(groupMember.userId, userId))
    )
    .limit(1);

  if (!membership) {
    return null;
  }

  // Get all members with user info
  const members = await db
    .select({
      id: groupMember.id,
      userId: groupMember.userId,
      role: groupMember.role,
      userName: user.name,
      userImage: user.image,
    })
    .from(groupMember)
    .innerJoin(user, eq(groupMember.userId, user.id))
    .where(eq(groupMember.groupId, groupId));

  // Get exclusions
  const exclusions = await db
    .select({
      id: exclusionRule.id,
      userId: exclusionRule.userId,
      excludedUserId: exclusionRule.excludedUserId,
      reason: exclusionRule.reason,
      createdAt: exclusionRule.createdAt,
    })
    .from(exclusionRule)
    .where(eq(exclusionRule.groupId, groupId));

  // Get user details for exclusions
  const exclusionsWithDetails = await Promise.all(
    exclusions.map(async (ex) => {
      const [userInfo] = await db
        .select({ name: user.name, image: user.image })
        .from(user)
        .where(eq(user.id, ex.userId))
        .limit(1);
      const [excludedUserInfo] = await db
        .select({ name: user.name, image: user.image })
        .from(user)
        .where(eq(user.id, ex.excludedUserId))
        .limit(1);
      return {
        ...ex,
        userName: userInfo?.name || "Unknown",
        userImage: userInfo?.image || null,
        excludedUserName: excludedUserInfo?.name || "Unknown",
        excludedUserImage: excludedUserInfo?.image || null,
      };
    })
  );

  // Get assignment if draw is completed
  let assignment = null;
  if (groupData.drawCompleted) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/groups/${groupId}/assignment`,
      {
        headers: {
          Cookie: (await headers()).get("cookie") || "",
        },
        cache: "no-store",
      }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.hasAssignment) {
        assignment = data;
      }
    }
  }

  return {
    group: groupData,
    membership,
    members: members.map((m) => ({
      id: m.userId,
      name: m.userName,
      image: m.userImage,
      role: m.role,
    })),
    exclusions: exclusionsWithDetails,
    assignment,
  };
}

export default async function DrawPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/");
  }

  const { groupId } = await params;
  const data = await getGroupData(groupId, session.user.id);

  if (!data) {
    notFound();
  }

  const { group: groupData, membership, members, exclusions, assignment } = data;
  const isAdmin = membership.role === "admin";

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-christmas-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
      
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/groups/${groupId}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Group
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-christmas-red to-berry-red rounded-xl shadow-lg">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-nunito text-foreground flex items-center gap-2">
              Secret Santa Draw
              <Sparkles className="h-5 w-5 text-christmas-gold animate-pulse" />
            </h1>
            <p className="text-muted-foreground text-lg">{groupData.name}</p>
          </div>
        </div>

        <div className="grid gap-8">
          {/* Countdown Timer */}
          {groupData.exchangeDate && (
            <CountdownTimer
              targetDate={new Date(groupData.exchangeDate)}
              label="Time Until Gift Exchange"
            />
          )}

          {/* Draw Controls */}
          <DrawControls
            groupId={groupId}
            drawCompleted={groupData.drawCompleted}
            memberCount={members.length}
            exchangeDate={groupData.exchangeDate}
            isAdmin={isAdmin}
          />

          {/* Assignment Reveal (only if draw is completed) */}
          {groupData.drawCompleted && assignment?.hasAssignment && (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-green rounded-2xl blur opacity-25" />
              <div className="relative">
                <AssignmentReveal
                  recipient={assignment.assignment.recipient}
                  budgetMin={groupData.budgetMin}
                  budgetMax={groupData.budgetMax}
                  currency={groupData.currency as Currency}
                  hasViewed={assignment.hasViewed}
                />
              </div>
            </div>
          )}

          {/* Exclusion Manager */}
          {!groupData.drawCompleted && (
            <ExclusionManager
              groupId={groupId}
              members={members}
              exclusions={exclusions}
              isAdmin={isAdmin}
            />
          )}

          {/* Quick Actions */}
          {groupData.drawCompleted && assignment?.hasAssignment && (
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              <Button asChild variant="outline" size="lg" className="border-christmas-red/20 hover:border-christmas-red hover:bg-christmas-red/5">
                <Link href={`/groups/${groupId}/wishlist`}>
                  <Gift className="h-5 w-5 mr-2 text-christmas-red" />
                  View Their Wishlist
                </Link>
              </Button>
              {groupData.exchangeDate && (
                <Button asChild variant="outline" size="lg">
                  <Link href={`/groups/${groupId}`}>
                    <Calendar className="h-5 w-5 mr-2" />
                    Event Details
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

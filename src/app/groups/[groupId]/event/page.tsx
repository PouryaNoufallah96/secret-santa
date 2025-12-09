"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Calendar } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { EventCard } from "@/components/events/event-card";
import { EventForm } from "@/components/events/event-form";
import { RSVPButtons } from "@/components/events/rsvp-buttons";
import { RSVPList } from "@/components/events/rsvp-list";
import { GroupActivityFeed } from "@/components/groups/group-activity-feed";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

type RSVPStatus = "attending" | "not_attending" | "maybe";

interface EventDetails {
  id: string;
  groupId: string;
  locationName: string | null;
  locationAddress: string | null;
  virtualLink: string | null;
  eventNotes: string | null;
}

interface RSVP {
  id: string;
  userId: string;
  status: RSVPStatus;
  note: string | null;
  updatedAt: string;
  userName: string;
  userImage: string | null;
}

interface EventData {
  event: EventDetails | null;
  exchangeDate: string | null;
  groupName: string;
  rsvps: RSVP[];
  currentUserRsvp: RSVP | null;
  currentUserRole: "admin" | "member";
}

export default function EventPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    async function fetchEvent() {
      try {
        const res = await fetch(`/api/groups/${groupId}/event`);
        if (!res.ok) {
          if (res.status === 403) {
            throw new Error("You are not a member of this group");
          }
          if (res.status === 404) {
            throw new Error("Group not found");
          }
          throw new Error("Failed to fetch event");
        }
        const eventData = await res.json();
        setData(eventData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
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
              You need to sign in to view this event
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

  const isAdmin = data.currentUserRole === "admin";
  const rsvpCounts = {
    attending: data.rsvps.filter((r) => r.status === "attending").length,
    not_attending: data.rsvps.filter((r) => r.status === "not_attending").length,
    maybe: data.rsvps.filter((r) => r.status === "maybe").length,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/groups/${groupId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Group
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-nunito text-christmas-red dark:text-christmas-gold flex items-center gap-3">
          <Calendar className="h-8 w-8" />
          Gift Exchange Event
        </h1>
        <p className="text-muted-foreground mt-2">
          Event details and RSVPs for {data.groupName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Card (View only for non-admins) */}
          {!isAdmin && (
            <EventCard
              event={data.event}
              exchangeDate={data.exchangeDate}
              groupName={data.groupName}
            />
          )}

          {/* Event Form (Admin only) */}
          {isAdmin && (
            <EventForm
              groupId={groupId}
              event={data.event}
              onUpdate={(updatedEvent) => {
                setData((prev) =>
                  prev ? { ...prev, event: updatedEvent } : null
                );
              }}
            />
          )}

          {/* RSVP Section */}
          <RSVPButtons
            groupId={groupId}
            currentStatus={data.currentUserRsvp?.status || null}
            currentNote={data.currentUserRsvp?.note || null}
            onUpdate={(status, note) => {
              setData((prev) => {
                if (!prev) return null;
                const existingIndex = prev.rsvps.findIndex(
                  (r) => r.userId === session.user.id
                );
                const updatedRsvp: RSVP = {
                  id: prev.currentUserRsvp?.id || crypto.randomUUID(),
                  userId: session.user.id,
                  status,
                  note,
                  updatedAt: new Date().toISOString(),
                  userName: session.user.name || "You",
                  userImage: session.user.image || null,
                };

                let newRsvps: RSVP[];
                if (existingIndex >= 0) {
                  newRsvps = [...prev.rsvps];
                  newRsvps[existingIndex] = updatedRsvp;
                } else {
                  newRsvps = [...prev.rsvps, updatedRsvp];
                }

                return {
                  ...prev,
                  rsvps: newRsvps,
                  currentUserRsvp: updatedRsvp,
                };
              });
            }}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Card in sidebar for admins */}
          {isAdmin && data.event && (
            <EventCard
              event={data.event}
              exchangeDate={data.exchangeDate}
              groupName={data.groupName}
            />
          )}

          {/* RSVP List */}
          <RSVPList rsvps={data.rsvps} counts={rsvpCounts} />

          {/* Activity Feed */}
          <GroupActivityFeed groupId={groupId} />
        </div>
      </div>
    </div>
  );
}

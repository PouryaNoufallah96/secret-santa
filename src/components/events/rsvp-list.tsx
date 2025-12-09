"use client";

import { Check, X, HelpCircle, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RSVPStatus = "attending" | "not_attending" | "maybe";

interface RSVP {
  id: string;
  userId: string;
  status: RSVPStatus;
  note: string | null;
  updatedAt: string;
  userName: string;
  userImage: string | null;
}

interface RSVPCounts {
  attending: number;
  not_attending: number;
  maybe: number;
}

interface RSVPListProps {
  rsvps: RSVP[];
  counts: RSVPCounts;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function RSVPItem({ rsvp }: { rsvp: RSVP }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={rsvp.userImage || undefined} alt={rsvp.userName} />
        <AvatarFallback className="bg-christmas-red/10 text-christmas-red text-xs">
          {getInitials(rsvp.userName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{rsvp.userName}</p>
        {rsvp.note && (
          <p className="text-sm text-muted-foreground truncate">{rsvp.note}</p>
        )}
      </div>
    </div>
  );
}

export function RSVPList({ rsvps, counts }: RSVPListProps) {
  const attendingRsvps = rsvps.filter((r) => r.status === "attending");
  const maybeRsvps = rsvps.filter((r) => r.status === "maybe");
  const notAttendingRsvps = rsvps.filter((r) => r.status === "not_attending");

  const totalResponses = counts.attending + counts.not_attending + counts.maybe;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          RSVPs
        </CardTitle>
        <CardDescription>
          {totalResponses} {totalResponses === 1 ? "response" : "responses"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {totalResponses === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No RSVPs yet. Be the first to respond!
          </p>
        ) : (
          <Tabs defaultValue="attending" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="attending" className="gap-1">
                <Check className="h-4 w-4 text-christmas-green" />
                <span className="hidden sm:inline">Going</span>
                <Badge variant="secondary" className="ml-1">
                  {counts.attending}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="maybe" className="gap-1">
                <HelpCircle className="h-4 w-4 text-christmas-gold" />
                <span className="hidden sm:inline">Maybe</span>
                <Badge variant="secondary" className="ml-1">
                  {counts.maybe}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="not_attending" className="gap-1">
                <X className="h-4 w-4 text-destructive" />
                <span className="hidden sm:inline">No</span>
                <Badge variant="secondary" className="ml-1">
                  {counts.not_attending}
                </Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="attending" className="mt-4">
              {attendingRsvps.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No one has confirmed yet
                </p>
              ) : (
                <div className="divide-y">
                  {attendingRsvps.map((rsvp) => (
                    <RSVPItem key={rsvp.id} rsvp={rsvp} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="maybe" className="mt-4">
              {maybeRsvps.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No maybes
                </p>
              ) : (
                <div className="divide-y">
                  {maybeRsvps.map((rsvp) => (
                    <RSVPItem key={rsvp.id} rsvp={rsvp} />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="not_attending" className="mt-4">
              {notAttendingRsvps.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No declines
                </p>
              ) : (
                <div className="divide-y">
                  {notAttendingRsvps.map((rsvp) => (
                    <RSVPItem key={rsvp.id} rsvp={rsvp} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

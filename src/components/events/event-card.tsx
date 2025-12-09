"use client";

import { Calendar, MapPin, Video, FileText, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatExchangeDate } from "@/lib/secret-santa";

interface EventDetails {
  id: string;
  groupId: string;
  locationName: string | null;
  locationAddress: string | null;
  virtualLink: string | null;
  eventNotes: string | null;
}

interface EventCardProps {
  event: EventDetails | null;
  exchangeDate: string | null;
  groupName: string;
}

export function EventCard({ event, exchangeDate, groupName }: EventCardProps) {
  const hasLocation = event?.locationName || event?.locationAddress;
  const hasVirtualLink = event?.virtualLink;
  const hasNotes = event?.eventNotes;
  const hasAnyDetails = hasLocation || hasVirtualLink || hasNotes;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-christmas-red" />
          {groupName} Exchange
        </CardTitle>
        {exchangeDate && (
          <CardDescription className="text-base">
            {formatExchangeDate(new Date(exchangeDate))}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAnyDetails && (
          <p className="text-muted-foreground">
            No event details have been set yet. Ask an admin to add location and
            meeting information.
          </p>
        )}

        {hasLocation && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{event?.locationName}</p>
              {event?.locationAddress && (
                <p className="text-sm text-muted-foreground">
                  {event.locationAddress}
                </p>
              )}
              {event?.locationAddress && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-christmas-green"
                  asChild
                >
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(event.locationAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Google Maps
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        )}

        {hasVirtualLink && (
          <div className="flex items-start gap-3">
            <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Virtual Meeting</p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-christmas-green"
                asChild
              >
                <a
                  href={event?.virtualLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Virtual Meeting
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        )}

        {hasNotes && (
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Notes</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event?.eventNotes}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

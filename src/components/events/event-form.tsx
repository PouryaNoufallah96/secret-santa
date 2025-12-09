"use client";

import { useState } from "react";
import { MapPin, Video, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventDetails {
  id: string;
  groupId: string;
  locationName: string | null;
  locationAddress: string | null;
  virtualLink: string | null;
  eventNotes: string | null;
}

interface EventFormProps {
  groupId: string;
  event: EventDetails | null;
  onUpdate: (event: EventDetails) => void;
}

export function EventForm({ groupId, event, onUpdate }: EventFormProps) {
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState(event?.locationName || "");
  const [locationAddress, setLocationAddress] = useState(
    event?.locationAddress || ""
  );
  const [virtualLink, setVirtualLink] = useState(event?.virtualLink || "");
  const [eventNotes, setEventNotes] = useState(event?.eventNotes || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/groups/${groupId}/event`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationName: locationName || null,
          locationAddress: locationAddress || null,
          virtualLink: virtualLink || null,
          eventNotes: eventNotes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update event");
      }

      const data = await res.json();
      onUpdate(data.event);
      toast.success("Event details updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
        <CardDescription>
          Set up the location and details for your gift exchange
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              In-Person Location
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="locationName">Venue Name</Label>
                <Input
                  id="locationName"
                  placeholder="e.g., John's House"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationAddress">Address</Label>
                <Input
                  id="locationAddress"
                  placeholder="e.g., 123 Christmas Lane"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  maxLength={500}
                />
              </div>
            </div>
          </div>

          {/* Virtual Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Video className="h-4 w-4" />
              Virtual Meeting
            </div>
            <div className="space-y-2">
              <Label htmlFor="virtualLink">Meeting Link</Label>
              <Input
                id="virtualLink"
                type="url"
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                value={virtualLink}
                onChange={(e) => setVirtualLink(e.target.value)}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                Add a Zoom, Google Meet, or other video call link for remote participants
              </p>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              Additional Notes
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventNotes">Notes</Label>
              <Textarea
                id="eventNotes"
                placeholder="e.g., Bring a dish to share! Parking available in the back."
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                maxLength={1000}
                rows={4}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-christmas-red hover:bg-christmas-red/90"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Event Details
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

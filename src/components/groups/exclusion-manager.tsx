"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserX, Plus, Trash2, Info, Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials } from "@/lib/secret-santa";

interface Member {
  id: string;
  name: string;
  image: string | null;
}

interface Exclusion {
  id: string;
  userId: string;
  excludedUserId: string;
  userName: string;
  excludedUserName: string;
  userImage: string | null;
  excludedUserImage: string | null;
  reason: string | null;
}

interface ExclusionManagerProps {
  groupId: string;
  members: Member[];
  exclusions: Exclusion[];
  isAdmin: boolean;
}

export function ExclusionManager({
  groupId,
  members,
  exclusions,
  isAdmin,
}: ExclusionManagerProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedExcluded, setSelectedExcluded] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddExclusion = async () => {
    if (!selectedMember || !selectedExcluded) {
      toast.error("Please select both members");
      return;
    }

    if (selectedMember === selectedExcluded) {
      toast.error("Cannot exclude the same person");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/exclusions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          excludedUserId: selectedExcluded,
          reason: reason || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add exclusion");
      }

      toast.success("Exclusion added", {
        description: "This pair won't be matched in the Secret Santa draw.",
      });

      setIsDialogOpen(false);
      setSelectedMember("");
      setSelectedExcluded("");
      setReason("");
      router.refresh();
    } catch (error) {
      toast.error("Failed to add exclusion", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExclusion = async (exclusionId: string) => {
    setDeletingId(exclusionId);
    try {
      const response = await fetch(
        `/api/groups/${groupId}/exclusions?exclusionId=${exclusionId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove exclusion");
      }

      toast.success("Exclusion removed");
      router.refresh();
    } catch (error) {
      toast.error("Failed to remove exclusion", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserX className="h-5 w-5" />
          Exclusion Rules
        </CardTitle>
        <CardDescription>
          Prevent certain pairs from being matched (e.g., couples, family members).
          Exclusions are mutual - if A can&apos;t draw B, then B can&apos;t draw A either.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Be careful not to add too many exclusions - this may make it impossible
            to generate valid assignments for the Secret Santa draw.
          </p>
        </div>

        {exclusions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No exclusion rules set</p>
            <p className="text-sm">All participants can be matched with anyone.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {exclusions.map((exclusion) => (
              <div
                key={exclusion.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarImage
                        src={exclusion.userImage || ""}
                        alt={exclusion.userName}
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(exclusion.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarImage
                        src={exclusion.excludedUserImage || ""}
                        alt={exclusion.excludedUserName}
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(exclusion.excludedUserName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {exclusion.userName}{" "}
                      <span className="text-muted-foreground font-normal">
                        can&apos;t be matched with
                      </span>{" "}
                      {exclusion.excludedUserName}
                    </p>
                    {exclusion.reason && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {exclusion.reason}
                      </Badge>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExclusion(exclusion.id)}
                    disabled={deletingId === exclusion.id}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Exclusion Rule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Exclusion Rule</DialogTitle>
                <DialogDescription>
                  These two members won&apos;t be able to draw each other in the
                  Secret Santa.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>First Member</Label>
                  <Select
                    value={selectedMember}
                    onValueChange={setSelectedMember}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={member.image || ""}
                                referrerPolicy="no-referrer"
                              />
                              <AvatarFallback className="text-xs">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            {member.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cannot be matched with</Label>
                  <Select
                    value={selectedExcluded}
                    onValueChange={setSelectedExcluded}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members
                        .filter((m) => m.id !== selectedMember)
                        .map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={member.image || ""}
                                  referrerPolicy="no-referrer"
                                />
                                <AvatarFallback className="text-xs">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Reason (optional)</Label>
                  <Input
                    placeholder="e.g., Married couple, Siblings"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={200}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddExclusion}
                  disabled={isSubmitting || !selectedMember || !selectedExcluded}
                >
                  {isSubmitting ? "Adding..." : "Add Exclusion"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

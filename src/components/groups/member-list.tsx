"use client";

import { useState } from "react";
import { MoreHorizontal, Crown, UserMinus, Shield, ShieldOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/secret-santa";

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

interface MemberListProps {
  members: Member[];
  currentUserId: string;
  currentUserRole: "admin" | "member";
  groupId: string;
  drawCompleted: boolean;
  onMemberUpdate: () => void;
}

export function MemberList({
  members,
  currentUserId,
  currentUserRole,
  groupId,
  drawCompleted,
  onMemberUpdate,
}: MemberListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    memberId: string;
    memberName: string;
    action: "remove" | "promote" | "demote";
  }>({ open: false, memberId: "", memberName: "", action: "remove" });

  const isAdmin = currentUserRole === "admin";
  const adminCount = members.filter((m) => m.role === "admin").length;

  async function handleAction(
    memberId: string,
    action: "remove" | "promote" | "demote"
  ) {
    setLoading(memberId);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          ...(action === "remove"
            ? { remove: true }
            : { role: action === "promote" ? "admin" : "member" }),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update member");
      }

      onMemberUpdate();
    } catch (error) {
      console.error("Error updating member:", error);
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(null);
      setConfirmDialog({ open: false, memberId: "", memberName: "", action: "remove" });
    }
  }

  function openConfirmDialog(
    memberId: string,
    memberName: string,
    action: "remove" | "promote" | "demote"
  ) {
    setConfirmDialog({ open: true, memberId, memberName, action });
  }

  return (
    <>
      <div className="space-y-3">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          const canManage = isAdmin && !isCurrentUser && !drawCompleted;
          const isLastAdmin = member.role === "admin" && adminCount === 1;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.userImage || undefined} />
                  <AvatarFallback className="bg-christmas-red/10 text-christmas-red">
                    {getInitials(member.userName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{member.userName}</span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                    {member.role === "admin" && (
                      <Badge
                        variant="outline"
                        className="border-christmas-gold text-christmas-gold text-xs"
                      >
                        <Crown className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.userEmail}
                  </p>
                </div>
              </div>

              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={loading === member.id}
                    >
                      {loading === member.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role === "member" ? (
                      <DropdownMenuItem
                        onClick={() =>
                          openConfirmDialog(member.id, member.userName, "promote")
                        }
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Make Admin
                      </DropdownMenuItem>
                    ) : (
                      !isLastAdmin && (
                        <DropdownMenuItem
                          onClick={() =>
                            openConfirmDialog(member.id, member.userName, "demote")
                          }
                        >
                          <ShieldOff className="mr-2 h-4 w-4" />
                          Remove Admin
                        </DropdownMenuItem>
                      )
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() =>
                        openConfirmDialog(member.id, member.userName, "remove")
                      }
                      disabled={isLastAdmin}
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove from Group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ ...confirmDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "remove"
                ? "Remove Member"
                : confirmDialog.action === "promote"
                  ? "Promote to Admin"
                  : "Remove Admin Role"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "remove" ? (
                <>
                  Are you sure you want to remove{" "}
                  <strong>{confirmDialog.memberName}</strong> from this group?
                  They will need a new invite to rejoin.
                </>
              ) : confirmDialog.action === "promote" ? (
                <>
                  Make <strong>{confirmDialog.memberName}</strong> an admin? They
                  will be able to manage group settings and members.
                </>
              ) : (
                <>
                  Remove admin role from <strong>{confirmDialog.memberName}</strong>
                  ? They will no longer be able to manage group settings.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleAction(confirmDialog.memberId, confirmDialog.action)
              }
              className={
                confirmDialog.action === "remove"
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              {confirmDialog.action === "remove"
                ? "Remove"
                : confirmDialog.action === "promote"
                  ? "Promote"
                  : "Demote"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

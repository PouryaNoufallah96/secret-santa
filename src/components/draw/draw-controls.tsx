"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Shuffle, RotateCcw, AlertTriangle, CheckCircle2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface DrawControlsProps {
  groupId: string;
  drawCompleted: boolean;
  memberCount: number;
  exchangeDate: Date | null;
  isAdmin: boolean;
  onDrawComplete?: () => void;
}

export function DrawControls({
  groupId,
  drawCompleted,
  memberCount,
  exchangeDate,
  isAdmin,
  onDrawComplete,
}: DrawControlsProps) {
  const router = useRouter();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const canDraw = memberCount >= 2 && !drawCompleted;
  const canReset = drawCompleted && (!exchangeDate || new Date() < exchangeDate);

  const handleDraw = async () => {
    setIsDrawing(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/draw`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete draw");
      }

      toast.success("Draw completed!", {
        description: "All participants have been assigned their Secret Santa recipient.",
      });

      onDrawComplete?.();
      router.refresh();
    } catch (error) {
      toast.error("Draw failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsDrawing(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/draw`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset draw");
      }

      toast.success("Draw reset", {
        description: "You can now perform a new Secret Santa draw.",
      });

      router.refresh();
    } catch (error) {
      toast.error("Reset failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Secret Santa Draw
          </CardTitle>
          <CardDescription>
            {drawCompleted
              ? "The draw has been completed. Check your assignment below!"
              : "Waiting for the group admin to initiate the Secret Santa draw."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {drawCompleted ? (
              <Badge className="bg-christmas-green">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Draw Complete
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Users className="h-3 w-3 mr-1" />
                {memberCount} participants ready
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="h-5 w-5" />
          Secret Santa Draw
        </CardTitle>
        <CardDescription>
          {drawCompleted
            ? "The draw has been completed! You can reset and redraw if needed."
            : "Randomly assign each participant a person to buy a gift for."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            {memberCount} participants
          </Badge>
          {drawCompleted && (
            <Badge className="bg-christmas-green">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Draw Complete
            </Badge>
          )}
        </div>

        {memberCount < 2 && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">
              You need at least 2 participants to perform a draw.
            </span>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {!drawCompleted ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={!canDraw || isDrawing}
                  className="bg-christmas-red hover:bg-christmas-red/90"
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                  {isDrawing ? "Drawing..." : "Start Draw"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Start Secret Santa Draw?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will randomly assign each participant a person to buy a gift
                    for. All {memberCount} participants will be notified of their
                    assignment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDraw}
                    className="bg-christmas-red hover:bg-christmas-red/90"
                  >
                    Start Draw
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            canReset && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={isResetting}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isResetting ? "Resetting..." : "Reset Draw"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset the Draw?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear all current assignments. You will need to
                      perform a new draw afterward. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReset}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Reset Draw
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

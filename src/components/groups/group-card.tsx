"use client";

import Link from "next/link";
import { Calendar, Users, Gift, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice, formatShortDate, daysUntil } from "@/lib/secret-santa";
import type { Group, Currency } from "@/lib/types";

interface GroupCardProps {
  group: Group & { memberCount: number };
  role: "admin" | "member";
}

export function GroupCard({ group, role }: GroupCardProps) {
  const daysLeft = group.exchangeDate
    ? daysUntil(new Date(group.exchangeDate))
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="font-nunito text-xl line-clamp-1">
            {group.name}
          </CardTitle>
          <div className="flex gap-2">
            {role === "admin" && (
              <Badge
                variant="outline"
                className="border-christmas-gold text-christmas-gold"
              >
                <Crown className="mr-1 h-3 w-3" />
                Admin
              </Badge>
            )}
            {group.drawCompleted && (
              <Badge className="bg-christmas-green text-white">
                <Gift className="mr-1 h-3 w-3" />
                Draw Complete
              </Badge>
            )}
          </div>
        </div>
        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {group.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
            </span>
          </div>
          {group.exchangeDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatShortDate(new Date(group.exchangeDate))}</span>
              {daysLeft !== null && daysLeft >= 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {daysLeft === 0
                    ? "Today!"
                    : daysLeft === 1
                      ? "Tomorrow"
                      : `${daysLeft} days`}
                </Badge>
              )}
            </div>
          )}
        </div>
        {(group.budgetMin || group.budgetMax) && (
          <div className="mt-3 text-sm">
            <span className="text-muted-foreground">Budget: </span>
            <span className="font-medium">
              {group.budgetMin && group.budgetMax
                ? `${formatPrice(group.budgetMin, group.currency as Currency)} - ${formatPrice(group.budgetMax, group.currency as Currency)}`
                : group.budgetMin
                  ? `Min ${formatPrice(group.budgetMin, group.currency as Currency)}`
                  : `Max ${formatPrice(group.budgetMax!, group.currency as Currency)}`}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          asChild
          className="w-full bg-christmas-red hover:bg-christmas-red/90"
        >
          <Link href={`/groups/${group.id}`}>View Group</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

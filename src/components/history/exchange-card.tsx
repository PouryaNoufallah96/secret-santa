"use client";

import { Gift, ArrowRight, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/secret-santa";
import type { Currency } from "@/lib/types";

interface GiftInfo {
  toName?: string;
  toImage?: string | null;
  fromName?: string;
  fromImage?: string | null;
  description: string | null;
  imageUrl: string | null;
}

interface ExchangeHistory {
  groupId: string;
  groupName: string;
  exchangeDate: string | null;
  currency: string;
  budgetMin: number | null;
  budgetMax: number | null;
  year: number;
  gave: GiftInfo | null;
  received: GiftInfo | null;
}

interface ExchangeCardProps {
  exchange: ExchangeHistory;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ExchangeCard({ exchange }: ExchangeCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-christmas-red" />
              {exchange.groupName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              {exchange.year}
              {(exchange.budgetMin || exchange.budgetMax) && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span>
                    {exchange.budgetMin &&
                      formatPrice(
                        exchange.budgetMin,
                        exchange.currency as Currency
                      )}
                    {exchange.budgetMin && exchange.budgetMax && " - "}
                    {exchange.budgetMax &&
                      formatPrice(
                        exchange.budgetMax,
                        exchange.currency as Currency
                      )}
                  </span>
                </>
              )}
            </CardDescription>
          </div>
          <Badge variant="secondary">{exchange.year}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gift Given */}
        {exchange.gave && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-christmas-green/5 border border-christmas-green/20">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">You gave to</span>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={exchange.gave.toImage || undefined}
                  alt={exchange.gave.toName || "Recipient"}
                />
                <AvatarFallback className="bg-christmas-green/10 text-christmas-green text-xs">
                  {exchange.gave.toName
                    ? getInitials(exchange.gave.toName)
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{exchange.gave.toName}</span>
            </div>
            {exchange.gave.description && (
              <>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{exchange.gave.description}</span>
              </>
            )}
          </div>
        )}

        {/* Gift Received */}
        {exchange.received && (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-christmas-red/5 border border-christmas-red/20">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                You received from
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={exchange.received.fromImage || undefined}
                  alt={exchange.received.fromName || "Santa"}
                />
                <AvatarFallback className="bg-christmas-red/10 text-christmas-red text-xs">
                  {exchange.received.fromName
                    ? getInitials(exchange.received.fromName)
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{exchange.received.fromName}</span>
            </div>
            {exchange.received.description && (
              <>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{exchange.received.description}</span>
              </>
            )}
          </div>
        )}

        {!exchange.gave && !exchange.received && (
          <p className="text-muted-foreground text-center py-4">
            No gift history recorded for this exchange
          </p>
        )}
      </CardContent>
    </Card>
  );
}

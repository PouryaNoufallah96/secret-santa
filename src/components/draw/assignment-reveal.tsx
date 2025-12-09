"use client";

import { useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials, formatPrice } from "@/lib/secret-santa";
import type { Currency } from "@/lib/types";

interface Recipient {
  id: string;
  name: string;
  image: string | null;
  email: string;
}

interface AssignmentRevealProps {
  recipient: Recipient;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: Currency;
  hasViewed: boolean;
  className?: string;
}

type RevealState = "wrapped" | "unwrapping" | "revealed";

export function AssignmentReveal({
  recipient,
  budgetMin,
  budgetMax,
  currency,
  hasViewed,
  className,
}: AssignmentRevealProps) {
  const [state, setState] = useState<RevealState>(hasViewed ? "revealed" : "wrapped");
  const [showConfetti, setShowConfetti] = useState(false);

  const handleReveal = () => {
    setState("unwrapping");
    setTimeout(() => {
      setState("revealed");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }, 1500);
  };

  return (
    <div className={cn("relative", className)}>
      {showConfetti && <Confetti />}

      {state === "wrapped" && (
        <WrappedGift onReveal={handleReveal} />
      )}

      {state === "unwrapping" && (
        <UnwrappingAnimation />
      )}

      {state === "revealed" && (
        <RevealedAssignment
          recipient={recipient}
          budgetMin={budgetMin}
          budgetMax={budgetMax}
          currency={currency}
        />
      )}
    </div>
  );
}

function WrappedGift({ onReveal }: { onReveal: () => void }) {
  return (
    <Card className="border-christmas-red/30 bg-gradient-to-br from-christmas-red/5 to-christmas-green/5">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="w-32 h-32 bg-christmas-red rounded-lg flex items-center justify-center relative overflow-hidden shadow-lg">
            {/* Gift box */}
            <div className="absolute inset-0 bg-christmas-red" />
            {/* Ribbon horizontal */}
            <div className="absolute top-1/2 left-0 right-0 h-4 bg-christmas-gold transform -translate-y-1/2" />
            {/* Ribbon vertical */}
            <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-christmas-gold transform -translate-x-1/2" />
            {/* Bow */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 flex items-center">
              <div className="w-6 h-6 bg-christmas-gold rounded-full -mr-2" />
              <div className="w-6 h-6 bg-christmas-gold rounded-full -ml-2" />
            </div>
            <Gift className="h-12 w-12 text-white relative z-10" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-christmas-gold animate-pulse" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Your Secret Santa Assignment</h3>
          <p className="text-muted-foreground">
            Click below to reveal who you&apos;ll be buying a gift for!
          </p>
        </div>

        <Button
          onClick={onReveal}
          size="lg"
          className="bg-christmas-red hover:bg-christmas-red/90"
        >
          <Gift className="h-5 w-5 mr-2" />
          Reveal Assignment
        </Button>
      </CardContent>
    </Card>
  );
}

function UnwrappingAnimation() {
  return (
    <Card className="border-christmas-gold/30 bg-gradient-to-br from-christmas-gold/10 to-christmas-red/10">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="w-32 h-32 flex items-center justify-center">
            <Gift className="h-16 w-16 text-christmas-red animate-bounce" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-christmas-gold rounded-full animate-spin border-t-transparent" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold animate-pulse">Unwrapping...</h3>
          <p className="text-muted-foreground">
            Preparing your special assignment!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function RevealedAssignment({
  recipient,
  budgetMin,
  budgetMax,
  currency,
}: {
  recipient: Recipient;
  budgetMin: number | null;
  budgetMax: number | null;
  currency: Currency;
}) {
  return (
    <Card className="border-christmas-green/30 bg-gradient-to-br from-christmas-green/5 to-christmas-gold/5">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-6">
        <div className="flex items-center gap-2 text-christmas-green">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium uppercase tracking-wider">
            You are the Secret Santa for
          </span>
          <Sparkles className="h-5 w-5" />
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24 border-4 border-christmas-gold shadow-lg">
            <AvatarImage
              src={recipient.image || ""}
              alt={recipient.name}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="text-2xl bg-christmas-red text-white">
              {getInitials(recipient.name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-3xl font-bold text-christmas-red">
              {recipient.name}
            </h2>
            <p className="text-muted-foreground">{recipient.email}</p>
          </div>
        </div>

        {(budgetMin || budgetMax) && (
          <div className="bg-muted/50 rounded-lg px-4 py-2">
            <span className="text-sm text-muted-foreground">Budget: </span>
            <span className="font-medium">
              {budgetMin && budgetMax
                ? `${formatPrice(budgetMin * 100, currency)} - ${formatPrice(budgetMax * 100, currency)}`
                : budgetMin
                  ? `Min ${formatPrice(budgetMin * 100, currency)}`
                  : budgetMax
                    ? `Max ${formatPrice(budgetMax * 100, currency)}`
                    : "No budget set"}
            </span>
          </div>
        )}

        <p className="text-sm text-muted-foreground max-w-md">
          Time to find the perfect gift! Check their wishlist for ideas, or get
          AI-powered suggestions based on their interests.
        </p>
      </CardContent>
    </Card>
  );
}

function generateParticles() {
  const colors = ["#D42426", "#165B33", "#F8B229", "#BB2528", "#146B3A"];
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)] ?? "#D42426",
    delay: Math.random() * 0.5,
  }));
}

function Confetti() {
  const [particles] = useState(generateParticles);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${particle.x}%`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

import Link from "next/link";
import { Gift, Home, Snowflake, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-background to-cream dark:from-background dark:to-pine-dark">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* Festive decoration */}
          <div className="flex justify-center items-center gap-2 mb-6">
            <Snowflake className="h-8 w-8 text-ice-blue animate-pulse" />
            <TreePine className="h-10 w-10 text-christmas-green" />
            <Gift className="h-12 w-12 text-christmas-red" />
            <TreePine className="h-10 w-10 text-christmas-green" />
            <Snowflake className="h-8 w-8 text-ice-blue animate-pulse" />
          </div>

          {/* 404 with festive styling */}
          <h1 className="text-8xl font-bold font-nunito text-christmas-red dark:text-christmas-gold mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold font-nunito mb-4 text-foreground">
            Oops! This gift got lost!
          </h2>
          <p className="text-muted-foreground mb-8">
            Looks like this page wandered off to the North Pole.
            Let&apos;s get you back to somewhere warm and cozy!
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-christmas-red hover:bg-christmas-red/90"
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-christmas-green text-christmas-green hover:bg-christmas-green/10"
            >
              <Link href="/dashboard">
                <Gift className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
            </Button>
          </div>

          {/* Decorative snowflakes */}
          <div className="mt-12 flex justify-center gap-4 opacity-30">
            <Snowflake className="h-4 w-4 text-christmas-red" />
            <Snowflake className="h-6 w-6 text-christmas-gold" />
            <Snowflake className="h-5 w-5 text-christmas-green" />
            <Snowflake className="h-4 w-4 text-christmas-red" />
            <Snowflake className="h-6 w-6 text-christmas-gold" />
          </div>
        </div>
      </div>
    </div>
  );
}

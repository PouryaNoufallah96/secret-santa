import Link from "next/link";
import { Gift, Users } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { ModeToggle } from "./ui/mode-toggle";
import { Button } from "./ui/button";
import { NotificationBellWrapper } from "./notifications/notification-bell-wrapper";

export function SiteHeader() {
  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-md"
      >
        Skip to main content
      </a>
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
        <nav
          className="container mx-auto px-4 py-4 flex justify-between items-center"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold">
              <Link
                href="/"
                className="flex items-center gap-2 text-christmas-red hover:text-christmas-red/80 transition-colors"
                aria-label="Secret Santa - Go to homepage"
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-christmas-red/10"
                  aria-hidden="true"
                >
                  <Gift className="h-5 w-5" />
                </div>
                <span className="font-nunito bg-gradient-to-r from-christmas-red to-christmas-green bg-clip-text text-transparent">
                  Secret Santa
                </span>
              </Link>
            </h1>
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/groups" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  My Groups
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4" role="group" aria-label="User actions">
            <NotificationBellWrapper />
            <UserProfile />
            <ModeToggle />
          </div>
        </nav>
      </header>
    </>
  );
}

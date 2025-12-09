import Link from "next/link";
import { BookOpen, Gift, Users, Sparkles } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { NotificationBellWrapper } from "./notifications/notification-bell-wrapper";
import { Button } from "./ui/button";
import { ModeToggle } from "./ui/mode-toggle";

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
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50" role="banner">
        <nav
          className="container mx-auto px-4 h-16 flex justify-between items-center"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold">
              <Link
                href="/"
                className="flex items-center gap-2 group transition-all"
                aria-label="Sleigh - Go to homepage"
              >
                <div
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-christmas-red to-berry-red shadow-lg transform group-hover:rotate-12 transition-transform duration-300"
                  aria-hidden="true"
                >
                  <Gift className="h-6 w-6 text-white" />
                  <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-0.5 shadow-sm">
                     <Sparkles className="h-3 w-3 text-christmas-gold animate-pulse" />
                  </div>
                </div>
                <span className="font-nunito font-black text-2xl tracking-tight bg-gradient-to-r from-christmas-red via-christmas-red to-berry-red bg-clip-text text-transparent group-hover:from-christmas-gold group-hover:to-christmas-red transition-all duration-300">
                  Sleigh
                </span>
              </Link>
            </h1>
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild className="hover:bg-christmas-red/5 hover:text-christmas-red transition-colors rounded-full px-4">
                <Link href="/groups" className="flex items-center gap-2 font-bold text-muted-foreground hover:text-christmas-red">
                  <Users className="h-4 w-4" />
                  My Groups
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="hover:bg-christmas-green/5 hover:text-christmas-green transition-colors rounded-full px-4">
                <Link href="/docs" className="flex items-center gap-2 font-bold text-muted-foreground hover:text-christmas-green">
                  <BookOpen className="h-4 w-4" />
                  Docs
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3" role="group" aria-label="User actions">
            <NotificationBellWrapper />
            <ModeToggle />
            <div className="pl-3 border-l border-border/50">
               <UserProfile />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

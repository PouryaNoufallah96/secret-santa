import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  Gift,
  HelpCircle,
  MessageSquare,
  Sparkles,
  UserPlus,
  Users,
  Calendar,
  ListChecks,
  Shuffle,
} from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const docs = [
  {
    title: "Getting Started",
    description: "Sign up and create your first Secret Santa exchange",
    href: "/docs/getting-started",
    icon: Gift,
  },
  {
    title: "Creating Groups",
    description: "Learn how to create and manage your groups",
    href: "/docs/creating-groups",
    icon: Users,
  },
  {
    title: "Joining Groups",
    description: "How to join existing exchanges with invite codes",
    href: "/docs/joining-groups",
    icon: UserPlus,
  },
  {
    title: "The Draw",
    description: "Understanding the Secret Santa draw and exclusions",
    href: "/docs/the-draw",
    icon: Shuffle,
  },
  {
    title: "Wishlists",
    description: "Create and manage gift wishlists",
    href: "/docs/wishlists",
    icon: ListChecks,
  },
  {
    title: "Messaging",
    description: "Anonymous messaging between Santas and recipients",
    href: "/docs/messaging",
    icon: MessageSquare,
  },
  {
    title: "Events",
    description: "Coordinate your exchange event and RSVPs",
    href: "/docs/events",
    icon: Calendar,
  },
  {
    title: "AI Suggestions",
    description: "Get personalized gift recommendations",
    href: "/docs/ai-suggestions",
    icon: Sparkles,
  },
  {
    title: "FAQ",
    description: "Frequently asked questions and troubleshooting",
    href: "/docs/faq",
    icon: HelpCircle,
  },
];

export default function DocsPage() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-christmas-red/10 dark:bg-christmas-red/20">
            <BookOpen className="h-6 w-6 text-christmas-red" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-nunito">Documentation</h1>
            <p className="text-muted-foreground">
              Learn how to use Secret Santa
            </p>
          </div>
        </div>

        <div className="mt-8 mb-6">
          <h2 className="text-xl font-semibold font-nunito mb-2">
            Quick Start
          </h2>
          <p className="text-muted-foreground">
            New to Secret Santa? Here&apos;s the basic workflow:
          </p>
          <ol className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-christmas-gold text-white text-xs font-bold">
                1
              </span>
              <span>Sign in with your Google account</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-christmas-gold text-white text-xs font-bold">
                2
              </span>
              <span>Create a group or join one with an invite code</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-christmas-gold text-white text-xs font-bold">
                3
              </span>
              <span>Add items to your wishlist</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-christmas-gold text-white text-xs font-bold">
                4
              </span>
              <span>Wait for the admin to run the draw</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-christmas-gold text-white text-xs font-bold">
                5
              </span>
              <span>View your assignment and start shopping!</span>
            </li>
          </ol>
        </div>

        <h2 className="text-xl font-semibold font-nunito mb-4">All Guides</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <Link key={doc.href} href={doc.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-christmas-red/10 dark:bg-christmas-red/20">
                      <doc.icon className="h-5 w-5 text-christmas-red" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <CardTitle className="text-lg mt-3">{doc.title}</CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

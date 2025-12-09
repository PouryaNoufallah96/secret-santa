"use client";

import Link from "next/link";
import {
  Gift,
  Users,
  Shuffle,
  ListChecks,
  Sparkles,
  ChevronRight,
  TreePine,
} from "lucide-react";
import { motion } from "motion/react";
import { SignInButton } from "@/components/auth/sign-in-button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { Snowfall } from "@/components/ui/snowfall";
import { useSession } from "@/lib/auth-client";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-christmas-red/10 dark:bg-christmas-red/20 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold font-nunito mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-christmas-gold text-white font-bold text-xl font-nunito mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold font-nunito mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[200px]">{description}</p>
    </div>
  );
}

export default function Home() {
  const { data: session, isPending } = useSession();

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <AuroraBackground className="min-h-[90vh]">
        <Snowfall />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="container mx-auto px-4 py-20 text-center relative z-10"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <TreePine className="h-12 w-12 text-white/90" />
            <Gift className="h-16 w-16 text-christmas-gold" />
            <TreePine className="h-12 w-12 text-white/90" />
          </div>
          <h1 className="font-nunito text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Secret Santa
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto mb-8">
            Create magical gift exchanges with friends, family, and coworkers.
            Make this holiday season unforgettable!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isPending ? (
              <Button
                size="lg"
                className="bg-christmas-gold hover:bg-christmas-gold/90 text-white font-semibold px-8"
                disabled
              >
                Loading...
              </Button>
            ) : session ? (
              <Button
                asChild
                size="lg"
                className="bg-christmas-gold hover:bg-christmas-gold/90 text-white font-semibold px-8"
              >
                <Link href="/dashboard">
                  Go to Dashboard
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <SignInButton />
            )}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/groups/join">Join with Code</Link>
            </Button>
          </div>
        </motion.div>
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </AuroraBackground>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-nunito text-christmas-red dark:text-christmas-gold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our Secret Santa app makes organizing gift exchanges simple, fun, and magical.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Users className="h-7 w-7 text-christmas-red" />}
              title="Easy Groups"
              description="Create groups and invite friends with a simple shareable code"
            />
            <FeatureCard
              icon={<Shuffle className="h-7 w-7 text-christmas-red" />}
              title="Fair Draw"
              description="Our algorithm ensures random, fair assignments with exclusion support"
            />
            <FeatureCard
              icon={<ListChecks className="h-7 w-7 text-christmas-red" />}
              title="Wishlists"
              description="Create wishlists so your Santa knows exactly what you want"
            />
            <FeatureCard
              icon={<Sparkles className="h-7 w-7 text-christmas-red" />}
              title="AI Suggestions"
              description="Get personalized gift ideas powered by AI within your budget"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-cream dark:bg-pine-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-nunito text-christmas-red dark:text-christmas-gold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started with your Secret Santa exchange in just a few simple steps
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <Step
              number={1}
              title="Create a Group"
              description="Set up your exchange with a name, budget, and date"
            />
            <div className="hidden md:block">
              <ChevronRight className="h-8 w-8 text-christmas-gold" />
            </div>
            <Step
              number={2}
              title="Invite Friends"
              description="Share your invite code with participants"
            />
            <div className="hidden md:block">
              <ChevronRight className="h-8 w-8 text-christmas-gold" />
            </div>
            <Step
              number={3}
              title="Draw Names"
              description="Let our algorithm fairly assign Secret Santas"
            />
            <div className="hidden md:block">
              <ChevronRight className="h-8 w-8 text-christmas-gold" />
            </div>
            <Step
              number={4}
              title="Exchange Gifts"
              description="Use wishlists and AI suggestions for the perfect gift"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Gift className="h-16 w-16 text-christmas-red dark:text-christmas-gold mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold font-nunito text-christmas-red dark:text-christmas-gold mb-4">
              Ready to Start?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of people making their holiday gift exchanges more magical.
              Sign up now and create your first Secret Santa group!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isPending ? (
                <Button
                  size="lg"
                  className="bg-christmas-red hover:bg-christmas-red/90"
                  disabled
                >
                  Loading...
                </Button>
              ) : session ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-christmas-red hover:bg-christmas-red/90"
                >
                  <Link href="/groups/new">
                    Create Your Group
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <SignInButton />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

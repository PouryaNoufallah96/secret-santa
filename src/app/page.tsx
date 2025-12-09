"use client";

import Link from "next/link";
import {
  Gift,
  Users,
  Shuffle,
  ListChecks,
  Sparkles,
  ChevronRight,
  Snowflake,
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
    <motion.div 
      whileHover={{ y: -5 }}
      className="flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-green opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-christmas-red/10 group-hover:bg-christmas-red/20 mb-6 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-nunito mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center relative z-10">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-christmas-gold text-white font-bold text-2xl font-nunito mb-6 shadow-lg shadow-christmas-gold/20">
        {number}
      </div>
      <h3 className="text-xl font-bold font-nunito mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-[250px] leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  const { data: session, isPending } = useSession();

  return (
    <main className="flex-1 bg-background">
      {/* Hero Section */}
      <AuroraBackground className="min-h-[90vh] relative">
        <Snowfall count={100} />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="container mx-auto px-4 py-20 text-center relative z-10"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-8 px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <Sparkles className="h-5 w-5 text-christmas-gold animate-pulse" />
            <span className="text-white font-medium tracking-wide">The Smartest Way to Gift</span>
            <Sparkles className="h-5 w-5 text-christmas-gold animate-pulse" />
          </div>
          
          <h1 className="font-nunito text-7xl md:text-8xl lg:text-9xl font-black text-white mb-6 drop-shadow-sm tracking-tighter leading-none">
            Sleigh
          </h1>
          
          <p className="text-xl md:text-3xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Modern. Magical. AI-Powered. <br/>
            <span className="font-medium text-christmas-gold">The upgrade your Secret Santa tradition needs.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isPending ? (
              <Button
                size="lg"
                className="bg-christmas-gold hover:bg-christmas-gold/90 text-white font-bold px-8 py-6 rounded-full text-lg shadow-xl shadow-christmas-gold/20"
                disabled
              >
                Loading...
              </Button>
            ) : session ? (
              <Button
                asChild
                size="lg"
                className="bg-christmas-gold hover:bg-christmas-gold/90 text-white font-bold px-8 py-6 rounded-full text-lg shadow-xl shadow-christmas-gold/20 hover:scale-105 transition-transform"
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
              className="border-white/40 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm px-8 py-6 rounded-full text-lg font-semibold hover:border-white transition-all"
            >
              <Link href="/groups/join">Join with Code</Link>
            </Button>
          </div>
        </motion.div>
        
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto block"
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
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-5">
            <Snowflake className="w-96 h-96" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="text-christmas-red font-bold tracking-wider uppercase text-sm mb-2 block">Why Choose Sleigh</span>
            <h2 className="text-4xl md:text-5xl font-bold font-nunito text-foreground mb-6">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Sleigh makes organizing gift exchanges simple, fun, and magical. 
              Focus on the giving, we'll handle the organizing.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="h-8 w-8 text-christmas-red" />}
              title="Easy Groups"
              description="Create groups and invite friends with a simple shareable code or link."
            />
            <FeatureCard
              icon={<Shuffle className="h-8 w-8 text-christmas-red" />}
              title="Fair Draw"
              description="Our smart algorithm ensures random, fair assignments with exclusion rules."
            />
            <FeatureCard
              icon={<ListChecks className="h-8 w-8 text-christmas-red" />}
              title="Smart Wishlists"
              description="Create wishlists with links and notes so your Santa knows exactly what you love."
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-christmas-red" />}
              title="AI Suggestions"
              description="Stuck on ideas? Get personalized gift suggestions powered by AI based on interests."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-cream/50 dark:bg-pine-dark/20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-christmas-green font-bold tracking-wider uppercase text-sm mb-2 block">Simple Process</span>
            <h2 className="text-4xl md:text-5xl font-bold font-nunito text-foreground mb-6">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started with your Sleigh exchange in just a few simple steps.
            </p>
          </div>
          
          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-christmas-gold/50 to-transparent -translate-y-1/2 z-0" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
              <Step
                number={1}
                title="Create Group"
                description="Set up your exchange with a name, budget, and date."
              />
              <Step
                number={2}
                title="Invite Friends"
                description="Share your unique invite code with all participants."
              />
              <Step
                number={3}
                title="Draw Names"
                description="Let Sleigh fairly assign Secret Santas to everyone."
              />
              <Step
                number={4}
                title="Exchange Gifts"
                description="Use wishlists and AI to find and give the perfect gift."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-christmas-red to-berry-red rounded-3xl p-12 md:p-16 text-center text-white relative shadow-2xl overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10">
              <Gift className="h-20 w-20 text-christmas-gold mx-auto mb-8 drop-shadow-md" />
              <h2 className="text-4xl md:text-5xl font-bold font-nunito mb-6">
                Ready to Start Your Exchange?
              </h2>
              <p className="text-white/90 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                Join thousands of people making their holiday gift exchanges more magical with Sleigh.
                Sign up now and create your first group for free!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isPending ? (
                  <Button
                    size="lg"
                    className="bg-white text-christmas-red hover:bg-white/90 font-bold px-8 py-6 rounded-full text-lg shadow-lg"
                    disabled
                  >
                    Loading...
                  </Button>
                ) : session ? (
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-christmas-red hover:bg-white/90 font-bold px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <Link href="/groups/new">
                      Create Your Group
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <div className="bg-white rounded-full p-1 shadow-lg">
                    <SignInButton />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

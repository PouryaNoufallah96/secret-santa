import { Geist, Geist_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Secret Santa - Gift Exchange Made Easy",
    template: "%s | Secret Santa",
  },
  description:
    "Create magical gift exchanges with friends, family, and coworkers. Organize Secret Santa draws, manage wishlists, and get AI-powered gift suggestions.",
  keywords: [
    "Secret Santa",
    "Gift Exchange",
    "Christmas",
    "Holiday",
    "Wishlist",
    "Gift Ideas",
    "AI Suggestions",
    "Group Gifts",
  ],
  authors: [{ name: "Leon van Zyl" }],
  creator: "Leon van Zyl",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Secret Santa",
    title: "Secret Santa - Gift Exchange Made Easy",
    description:
      "Create magical gift exchanges with friends, family, and coworkers. Organize Secret Santa draws, manage wishlists, and get AI-powered gift suggestions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Secret Santa - Gift Exchange Made Easy",
    description:
      "Create magical gift exchanges with friends, family, and coworkers. Organize Secret Santa draws, manage wishlists, and get AI-powered gift suggestions.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Secret Santa",
  description:
    "Create magical gift exchanges with friends, family, and coworkers. Organize Secret Santa draws, manage wishlists, and get AI-powered gift suggestions.",
  applicationCategory: "SocialApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Leon van Zyl",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}

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
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Sleigh - Modern Gift Exchange & Secret Santa App",
    template: "%s | Sleigh",
  },
  description:
    "The modern way to organize Secret Santa exchanges. Create groups, manage smart wishlists, and get AI-powered gift suggestions with Sleigh.",
  keywords: [
    "Secret Santa",
    "Sleigh",
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
    siteName: "Sleigh",
    title: "Sleigh - Modern Gift Exchange & Secret Santa App",
    description:
      "The modern way to organize Secret Santa exchanges. Create groups, manage smart wishlists, and get AI-powered gift suggestions with Sleigh.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sleigh - Modern Gift Exchange & Secret Santa App",
    description:
      "The modern way to organize Secret Santa exchanges. Create groups, manage smart wishlists, and get AI-powered gift suggestions with Sleigh.",
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
  name: "Sleigh",
  description:
    "The modern way to organize Secret Santa exchanges. Create groups, manage smart wishlists, and get AI-powered gift suggestions with Sleigh.",
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

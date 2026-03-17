import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://networkajob.io";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NAJ | Tech Sales Recruiting & Career Coaching | Network Ferociously",
    template: "%s | NAJ",
  },
  description:
    "NAJ helps candidates break into Tech sales and helps employers build revenue teams. Former hiring managers provide personalized coaching, interview prep, and proven playbooks.",
  keywords: [
    "tech sales recruiting",
    "SaaS sales careers",
    "sales development representative",
    "account executive",
    "sales coaching",
    "career coaching",
    "GTM hiring",
    "sales hiring",
  ],
  authors: [{ name: "NAJ", url: SITE_URL }],
  creator: "NAJ",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "NAJ",
    title: "NAJ | Tech Sales Recruiting & Career Coaching",
    description: "Break into Tech sales or build your revenue team. Personalized coaching from former hiring managers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NAJ | Tech Sales Recruiting & Career Coaching",
    description: "Break into Tech sales or build your revenue team. Personalized coaching from former hiring managers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-w-0 overflow-x-hidden antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { LayoutWrapper } from "@/components/layout-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const PROJECT_ICON = "/icon/LinkForge%20AI%20logo.png";
const DEFAULT_SITE_URL = "http://localhost:3000";

function getMetadataBase() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    DEFAULT_SITE_URL;

  try {
    return new URL(rawUrl);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

export const metadata: Metadata = {
  title: "LinkForge AI - Intelligent Portfolio Management",
  description: "AI-powered portfolio management with Chainlink integration",
  metadataBase: getMetadataBase(),
  icons: {
    icon: PROJECT_ICON,
    shortcut: PROJECT_ICON,
    apple: PROJECT_ICON,
  },
  openGraph: {
    title: "LinkForge AI - Intelligent Portfolio Management",
    description: "AI-powered portfolio management with Chainlink integration",
    images: [PROJECT_ICON],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkForge AI - Intelligent Portfolio Management",
    description: "AI-powered portfolio management with Chainlink integration",
    images: [PROJECT_ICON],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

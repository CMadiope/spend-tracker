import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import { AppNav } from "@/components/shell/app-nav";
import {
  HeaderStatus,
  HeaderStatusFallback,
} from "@/components/shell/header-status";
import "./globals.css";

const barlow = localFont({
  src: [
    { path: "./fonts/barlow-latin-400-normal.woff2", weight: "400" },
    { path: "./fonts/barlow-latin-500-normal.woff2", weight: "500" },
    { path: "./fonts/barlow-latin-600-normal.woff2", weight: "600" },
    { path: "./fonts/barlow-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: {
    default: "Spend Tracker",
    template: "%s · Spend Tracker",
  },
  description: "Customer spending insights dashboard with demo data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={barlow.variable}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-20 focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-text"
        >
          Skip to content
        </a>
        <div className="min-h-dvh md:grid md:grid-cols-[14rem_1fr]">
          <AppNav />
          <div className="flex min-w-0 flex-col">
            <header className="flex items-center justify-between gap-4 border-b border-border bg-header px-4 py-3 md:px-8">
              <span className="font-semibold text-header-text md:invisible">
                Spend Tracker
              </span>
              <div className="flex items-center gap-3">
                <span className="border border-border px-2 py-0.5 text-xs font-medium tracking-wide text-muted uppercase">
                  Demo data
                </span>
                <Suspense fallback={<HeaderStatusFallback />}>
                  <HeaderStatus />
                </Suspense>
              </div>
            </header>
            <main id="main" className="flex-1 px-4 pt-6 pb-24 md:px-8 md:pb-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

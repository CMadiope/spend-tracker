import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import { AppNav } from "@/components/shell/app-nav";
import "./globals.css";

const barlow = Barlow({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
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
              <span className="border border-border px-2 py-0.5 text-xs font-medium tracking-wide text-muted uppercase">
                Demo data
              </span>
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

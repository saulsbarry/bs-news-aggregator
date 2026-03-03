import "./../styles/globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://bs-news-aggregator-web.vercel.app";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "BS News Aggregator",
  description: "AI-powered news aggregation with summaries and clustering.",
  openGraph: {
    siteName: "BS News",
    images: [{ url: "/api/og?title=BS+News", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-200 dark:border-slate-800">
            <div className="mx-auto max-w-5xl px-4 py-4 flex flex-wrap items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                  <rect width="32" height="32" rx="7" fill="#2563eb"/>
                  <rect x="6" y="7" width="20" height="5" rx="1.5" fill="white"/>
                  <rect x="6" y="15" width="9" height="10" rx="1.5" fill="white" fillOpacity="0.75"/>
                  <rect x="18" y="15" width="8" height="2" rx="1" fill="white"/>
                  <rect x="18" y="19" width="6" height="2" rx="1" fill="white" fillOpacity="0.8"/>
                  <rect x="18" y="23" width="7" height="2" rx="1" fill="white" fillOpacity="0.6"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-xl font-semibold tracking-tight">
                    BS News
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    AI summaries, clustered stories, ranked by engagement
                  </span>
                </div>
              </Link>
              <nav className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Home
                </Link>
                <Link
                  href="/search"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Search
                </Link>
                <Link
                  href="/sources"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  Sources
                </Link>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 py-4">
            <div className="mx-auto max-w-5xl px-4 flex items-center justify-between">
              <span>&copy; {new Date().getFullYear()} BS News Aggregator</span>
              <span>Updated every 30 minutes</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}



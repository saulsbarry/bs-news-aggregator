import "./../styles/globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";

export const metadata = {
  title: "BS News Aggregator",
  description: "AI-powered news aggregation with summaries and clustering."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-200 dark:border-slate-800">
            <div className="mx-auto max-w-5xl px-4 py-4 flex flex-wrap items-center justify-between gap-4">
              <Link href="/" className="flex flex-col">
                <span className="text-xl font-semibold tracking-tight">
                  BS News
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  AI summaries, clustered stories, ranked by engagement
                </span>
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



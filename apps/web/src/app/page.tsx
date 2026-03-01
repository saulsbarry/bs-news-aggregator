import Link from "next/link";
import { getRankedFeed } from "../lib/feed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const feed = await getRankedFeed({ limit: 20, offset: 0 });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Top stories
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Clustered, summarized news stories ranked by freshness and
          engagement. Auto-updated every 30 minutes.
        </p>
      </section>

      <section className="space-y-4">
        {feed.clusters.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No stories yet. Once ingestion is configured and running, fresh
            stories will appear here.
          </p>
        )}

        <ul className="space-y-4">
          {feed.clusters.map((cluster) => (
            <li
              key={cluster.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 shadow-sm p-4 flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/story/${cluster.id}`}
                  className="text-base font-semibold leading-snug hover:underline"
                >
                  {cluster.mainTitle}
                </Link>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  {cluster.articleCount} articles • {cluster.primaryTopic ?? "General"}
                </span>
              </div>
              {cluster.summary && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {cluster.summary}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Sources:{" "}
                  {cluster.sourceNames.length > 0
                    ? cluster.sourceNames.join(", ")
                    : "TBD"}
                </span>
                <span>
                  Updated {cluster.lastUpdatedHuman ?? "recently"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}


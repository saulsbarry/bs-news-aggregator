"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { RankedCluster } from "../lib/feed";

const PAGE_SIZE = 20;

export function ClusterFeed({ initialClusters }: { initialClusters: RankedCluster[] }) {
  const [clusters, setClusters] = useState(initialClusters);
  const [offset, setOffset] = useState(initialClusters.length);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialClusters.length === PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, hasMore, offset]);

  async function loadMore() {
    setLoading(true);
    try {
      const res = await fetch(`/api/feed?limit=${PAGE_SIZE}&offset=${offset}`);
      const data = await res.json();
      const next: RankedCluster[] = data.clusters ?? [];
      setClusters((prev) => [...prev, ...next]);
      setOffset((prev) => prev + next.length);
      if (next.length < PAGE_SIZE) setHasMore(false);
    } catch {
      // silently fail — user can scroll again to retry
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ul className="space-y-4">
        {clusters.map((cluster) => (
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
              <span>Updated {cluster.lastUpdatedHuman ?? "recently"}</span>
            </div>
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
        {loading && "Loading more stories…"}
        {!hasMore && clusters.length > 0 && "You're all caught up."}
      </div>
    </>
  );
}

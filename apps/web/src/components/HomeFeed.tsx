"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RankedCluster } from "../lib/feed";
import type { SourceItem } from "../lib/sources";
import { MultiSelect } from "./MultiSelect";

const PAGE_SIZE = 20;

const TIME_RANGES = [
  { value: "", label: "All time" },
  { value: "24h", label: "24h" },
  { value: "48h", label: "48h" },
  { value: "7d", label: "7d" },
];

interface Props {
  initialClusters: RankedCluster[];
  sources: SourceItem[];
  topics: string[];
}

export function HomeFeed({ initialClusters, sources, topics }: Props) {
  const [clusters, setClusters] = useState(initialClusters);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialClusters.length === PAGE_SIZE);

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState("");

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const offsetRef = useRef(initialClusters.length);
  const hasMoreRef = useRef(initialClusters.length === PAGE_SIZE);
  const filtersRef = useRef({ selectedTopics, selectedSourceIds, timeRange });
  const firstRender = useRef(true);

  // Keep refs in sync
  filtersRef.current = { selectedTopics, selectedSourceIds, timeRange };
  hasMoreRef.current = hasMore;

  function buildUrl(offset: number, f: typeof filtersRef.current) {
    const p = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    f.selectedTopics.forEach((t) => p.append("topic", t));
    f.selectedSourceIds.forEach((s) => p.append("sourceId", s));
    if (f.timeRange) p.set("timeRange", f.timeRange);
    return `/api/feed?${p}`;
  }

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const res = await fetch(buildUrl(offsetRef.current, filtersRef.current));
      const data = await res.json();
      const next: RankedCluster[] = data.clusters ?? [];
      setClusters((prev) => [...prev, ...next]);
      offsetRef.current += next.length;
      if (next.length < PAGE_SIZE) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch {
      // silent — user can scroll again to retry
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Infinite scroll observer — set up once
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // Reset and refetch when filters change
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    let cancelled = false;
    offsetRef.current = 0;
    hasMoreRef.current = true;
    loadingRef.current = true;
    setClusters([]);
    setHasMore(true);
    setLoading(true);

    const filters = filtersRef.current;
    fetch(buildUrl(0, filters))
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const next: RankedCluster[] = data.clusters ?? [];
        setClusters(next);
        offsetRef.current = next.length;
        if (next.length < PAGE_SIZE) {
          hasMoreRef.current = false;
          setHasMore(false);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          loadingRef.current = false;
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTopics, selectedSourceIds, timeRange]);

  const sourceOptions = sources.map((s) => ({ value: s.id, label: s.name }));
  const topicOptions = topics.map((t) => ({ value: t, label: t }));
  const hasActiveFilters =
    selectedTopics.length > 0 || selectedSourceIds.length > 0 || timeRange !== "";

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <MultiSelect
          options={topicOptions}
          selected={selectedTopics}
          onChange={setSelectedTopics}
          placeholder="Topics"
        />
        <MultiSelect
          options={sourceOptions}
          selected={selectedSourceIds}
          onChange={setSelectedSourceIds}
          placeholder="Sources"
        />
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-sm">
          {TIME_RANGES.map((tr) => (
            <button
              key={tr.value}
              onClick={() => setTimeRange(tr.value)}
              className={`px-3 py-1.5 transition ${
                timeRange === tr.value
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSelectedTopics([]);
              setSelectedSourceIds([]);
              setTimeRange("");
            }}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Cluster list */}
      {!loading && clusters.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
          No stories match your filters.
        </p>
      )}

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
                {cluster.articleCount} articles •{" "}
                {cluster.primaryTopic ?? "General"}
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

      <div
        ref={sentinelRef}
        className="py-4 text-center text-sm text-slate-500 dark:text-slate-400"
      >
        {loading && "Loading…"}
        {!loading && !hasMore && clusters.length > 0 && "You're all caught up."}
      </div>
    </div>
  );
}

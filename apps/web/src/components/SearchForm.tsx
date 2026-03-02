"use client";

import { useState } from "react";
import type { SourceItem } from "../lib/sources";

const TIME_RANGES = [
  { value: "", label: "All" },
  { value: "6h", label: "6h" },
  { value: "12h", label: "12h" },
  { value: "24h", label: "24h" },
  { value: "48h", label: "48h" },
  { value: "7d", label: "7d" },
];

interface Props {
  q: string;
  topic: string;
  sourceId: string;
  timeRange: string;
  sources: SourceItem[];
}

export function SearchForm({ q, topic, sourceId, timeRange: initialTimeRange, sources }: Props) {
  const [timeRange, setTimeRange] = useState(initialTimeRange);

  return (
    <form method="get" action="/search" className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <label className="flex-1 flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Query</span>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search articles..."
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Topic</span>
          <input
            type="text"
            name="topic"
            defaultValue={topic}
            placeholder="e.g. Technology"
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm w-40"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Source</span>
          <select
            name="sourceId"
            defaultValue={sourceId}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm min-w-[180px]"
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Search
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Time range</span>
        {TIME_RANGES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setTimeRange(r.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              timeRange === r.value
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:border-slate-500"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <input type="hidden" name="timeRange" value={timeRange} />
    </form>
  );
}

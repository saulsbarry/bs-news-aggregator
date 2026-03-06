import Link from "next/link";
import type { TrendingTopic } from "../lib/trending";

interface Props {
  topics: TrendingTopic[];
}

export function TrendingTopics({ topics }: Props) {
  if (topics.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        Trending
      </h2>
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <Link
            key={t.topic}
            href={`/?topic=${encodeURIComponent(t.topic)}`}
            className="px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-700 dark:hover:text-blue-300 transition"
          >
            {t.topic}
          </Link>
        ))}
      </div>
    </section>
  );
}

import { getRankedFeed } from "../lib/feed";
import { getSources } from "../lib/sources";
import { getTrendingTopics } from "../lib/trending";
import { HomeFeed } from "../components/HomeFeed";
import { TrendingTopics } from "../components/TrendingTopics";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ topic?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const { topic } = await searchParams;
  const defaultTopics = topic ? [topic] : [];

  const [feed, sources, trendingTopics] = await Promise.all([
    getRankedFeed({ limit: 20, offset: 0, topics: defaultTopics.length > 0 ? defaultTopics : undefined }),
    getSources(),
    getTrendingTopics(),
  ]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Top stories</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Clustered, summarized news stories ranked by freshness and engagement.
          Auto-updated every 30 minutes.
        </p>
      </section>

      <TrendingTopics topics={trendingTopics} />

      {feed.clusters.length === 0 && defaultTopics.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No stories yet. Once ingestion is configured and running, fresh stories
          will appear here.
        </p>
      ) : (
        <HomeFeed
          initialClusters={feed.clusters}
          sources={sources.filter((s) => s.isActive)}
          defaultTopics={defaultTopics}
        />
      )}
    </div>
  );
}

import { getRankedFeed } from "../lib/feed";
import { ClusterFeed } from "../components/ClusterFeed";

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
        {feed.clusters.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No stories yet. Once ingestion is configured and running, fresh
            stories will appear here.
          </p>
        ) : (
          <ClusterFeed initialClusters={feed.clusters} />
        )}
      </section>
    </div>
  );
}

